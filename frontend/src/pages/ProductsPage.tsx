import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { getProducts, createProduct, deleteProduct, updateProduct } from '../api/products';
import { getCategories } from '../api/categories';

interface Product {
  id_product: number;
  product_name: string;
  manufacturer: string;
  characteristics: string;
  category_name?: string;
  category_number?: number;
}

interface Category {
  category_number: number;
  category_name: string;
}

const emptyForm = {
  category_number: '',
  product_name: '',
  manufacturer: '',
  characteristics: '',
};

const field = (label: string, children: React.ReactNode, required = false) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
    <label style={{ fontSize: '0.8rem', color: '#666' }}>
      {label}{required && <span style={{ color: 'red' }}> *</span>}
    </label>
    {children}
  </div>
);

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const fetchProducts = () => {
    getProducts()
      .then((data) => {
        const mapped = data.map((row: any[]) => ({
          id_product: row[0],
          product_name: row[1],
          manufacturer: row[2],
          characteristics: row[3],
          category_number: row[4],
          category_name: row[5],
        }));
        setProducts(mapped);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    getCategories().then((data) => {
      setCategories(data.map((row: any[]) => ({
        category_number: row[0],
        category_name: row[1],
      })));
    });
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      p.product_name.toLowerCase().includes(q)
    );
  }, [search, products]);

  const handleDelete = (id: number) => {
    if (confirm('Видалити товар?')) {
      deleteProduct(id).then(fetchProducts);
    }
  };

  const handleEdit = (p: Product) => {
    setEditId(p.id_product);
    setForm({
      category_number: String(p.category_number),
      product_name: p.product_name,
      manufacturer: p.manufacturer,
      characteristics: p.characteristics,
    });
    setShowForm(true);
    setError('');
    setTouched({});
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
    setError('');
    setTouched({});
  };

  const requiredFields = ['category_number', 'product_name', 'manufacturer', 'characteristics'];

  const isInvalid = (f: string) => touched[f] && requiredFields.includes(f) && !form[f as keyof typeof form];

  const inputStyle = (f: string) => ({
    padding: '0.5rem',
    width: '100%',
    border: isInvalid(f) ? '1px solid red' : '1px solid #ccc',
    borderRadius: '4px',
  });

  const handleSubmit = async () => {
    const allTouched = Object.fromEntries(requiredFields.map(f => [f, true]));
    setTouched(allTouched);
    const hasEmpty = requiredFields.some(f => !form[f as keyof typeof form]);
    if (hasEmpty) {
      setError("Заповніть всі обов'язкові поля");
      return;
    }
    setError('');
    try {
      if (editId) {
        await updateProduct(editId, {
          category_number: parseInt(form.category_number),
          product_name: form.product_name,
          manufacturer: form.manufacturer,
          characteristics: form.characteristics,
        });
      } else {
        await createProduct({
          ...form,
          category_number: parseInt(form.category_number),
        });
      }
      handleCancel();
      fetchProducts();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((e: any) => e.msg).join(', '));
      } else {
        setError(detail || 'Помилка');
      }
    }
  };

  return (
    <Layout>
      <h1>Товари</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          className="search-input"
          type="text"
          placeholder="Пошук за назвою..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => { setEditId(null); setForm(emptyForm); setShowForm(!showForm); setError(''); setTouched({}); }}>
          {showForm && !editId ? 'Скасувати' : '+ Додати товар'}
        </button>
      </div>

      {showForm && (
        <div style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <h3>{editId ? 'Редагувати товар' : 'Новий товар'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {field('Категорія', (
              <select style={inputStyle('category_number')} value={form.category_number} onChange={e => setForm({...form, category_number: e.target.value})}>
                <option value="">— Оберіть категорію —</option>
                {categories.map(c => (
                  <option key={c.category_number} value={c.category_number}>{c.category_name}</option>
                ))}
              </select>
            ), true)}
            {field('Назва', <input style={inputStyle('product_name')} value={form.product_name} onChange={e => setForm({...form, product_name: e.target.value})} />, true)}
            {field('Виробник', <input style={inputStyle('manufacturer')} value={form.manufacturer} onChange={e => setForm({...form, manufacturer: e.target.value})} />, true)}
            {field('Характеристики', <input style={inputStyle('characteristics')} value={form.characteristics} onChange={e => setForm({...form, characteristics: e.target.value})} />, true)}
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button onClick={handleSubmit}>Зберегти</button>
            <button onClick={handleCancel}>Скасувати</button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Завантаження...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Назва</th>
              <th>Виробник</th>
              <th>Характеристики</th>
              <th>Категорія</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id_product}>
                <td>{p.id_product}</td>
                <td>{p.product_name}</td>
                <td>{p.manufacturer}</td>
                <td>{p.characteristics}</td>
                <td>{p.category_name}</td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(p)}>Редагувати</button>
                  <button onClick={() => handleDelete(p.id_product)}>Видалити</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && filtered.length === 0 && <p>Товарів не знайдено</p>}
    </Layout>
  );
}