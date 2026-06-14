import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getStoreProducts, deleteStoreProduct, createStoreProduct, updateStoreProduct } from '../api/store_products';
import { getProducts } from '../api/products';

interface StoreProduct {
  UPC: string;
  UPC_prom: string | null;
  selling_price: number;
  products_number: number;
  promotional_product: boolean;
  product_name?: string;
}

interface Product {
  id_product: number;
  product_name: string;
  category_number?: number;
  category_name?: string;
}

const emptyForm = {
  UPC: '',
  UPC_prom: '',
  id_product: '',
  selling_price: '',
  products_number: '',
  promotional_product: false,
};

const field = (label: string, children: React.ReactNode) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
    <label style={{ fontSize: '0.8rem', color: '#666' }}>{label}</label>
    {children}
  </div>
);

export default function StoreProductsPage() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'promotional' | 'non-promotional'>('all');
  const [upcSearch, setUpcSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editUPC, setEditUPC] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const fetchProducts = (f = filter) => {
    setLoading(true);
    const promotional = f === 'all' ? undefined : f === 'promotional';
    getStoreProducts(promotional)
      .then((data) => {
        const mapped = data.map((row: any[]) => ({
          UPC: row[0],
          UPC_prom: row[1],
          selling_price: row[2],
          products_number: row[3],
          promotional_product: row[4],
          product_name: row[5],
        }));
        setProducts(mapped);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    getProducts().then((data) => {
      setAllProducts(data.map((row: any[]) => ({
        id_product: row[0],
        product_name: row[1],
        category_number: row[4],
        category_name: row[5],
      })));
    });
  }, []);

  const handleFilter = (f: 'all' | 'promotional' | 'non-promotional') => {
    setFilter(f);
    fetchProducts(f);
  };

  const handleDelete = (upc: string) => {
    if (confirm('Видалити товар з магазину?')) {
      deleteStoreProduct(upc).then(() => fetchProducts());
    }
  };

  const handleEdit = (p: StoreProduct) => {
    setEditUPC(p.UPC);
    setForm({
      UPC: p.UPC,
      UPC_prom: p.UPC_prom || '',
      id_product: '',
      selling_price: String(p.selling_price),
      products_number: String(p.products_number),
      promotional_product: p.promotional_product,
    });
    setShowForm(true);
    setError('');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditUPC(null);
    setForm(emptyForm);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    try {
      if (editUPC) {
        await updateStoreProduct(editUPC, {
          selling_price: parseFloat(form.selling_price),
          products_number: parseInt(form.products_number),
        });
      } else {
        await createStoreProduct({
          UPC: form.UPC,
          UPC_prom: form.UPC_prom || null,
          id_product: parseInt(form.id_product),
          selling_price: parseFloat(form.selling_price),
          products_number: parseInt(form.products_number),
          promotional_product: form.promotional_product,
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

  const filtered = products.filter(p =>
    upcSearch ? p.UPC.includes(upcSearch) : true
  );

  const selectedProduct = allProducts.find(p => String(p.id_product) === form.id_product);
  const inputStyle = { padding: '0.5rem', width: '100%' };

  return (
    <Layout>
      <h1>Товари в магазині</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button onClick={() => handleFilter('all')}>Всі</button>
        <button onClick={() => handleFilter('promotional')}>Акційні</button>
        <button onClick={() => handleFilter('non-promotional')}>Не акційні</button>
        <input
          className="search-input"
          type="text"
          placeholder="Пошук за UPC..."
          value={upcSearch}
          onChange={(e) => setUpcSearch(e.target.value)}
        />
        <button onClick={() => { setEditUPC(null); setForm(emptyForm); setShowForm(!showForm); setError(''); }}>
          {showForm && !editUPC ? 'Скасувати' : '+ Додати товар'}
        </button>
      </div>

      {showForm && (
        <div style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <h3>{editUPC ? 'Редагувати товар у магазині' : 'Новий товар у магазині'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {!editUPC && field('Товар', (
              <select style={inputStyle} value={form.id_product} onChange={e => {
                const id = e.target.value;
                setForm({...form, id_product: id, UPC: ''});
              }}>
                <option value="">— Оберіть товар —</option>
                {allProducts.map(p => (
                  <option key={p.id_product} value={p.id_product}>{p.product_name}</option>
                ))}
              </select>
            ))}
            {!editUPC && field('UPC', (
              <div>
                <input style={inputStyle} value={form.UPC} onChange={e => setForm({...form, UPC: e.target.value})} />
                {selectedProduct && (
                  <small style={{ color: '#666' }}>
                    Підказка: UPC має починатись з {selectedProduct.category_number} ({selectedProduct.category_name})
                  </small>
                )}
              </div>
            ))}
            {field('Ціна продажу', <input style={inputStyle} type="number" value={form.selling_price} onChange={e => setForm({...form, selling_price: e.target.value})} />)}
            {field('Кількість', <input style={inputStyle} type="number" value={form.products_number} onChange={e => setForm({...form, products_number: e.target.value})} />)}
            {!editUPC && field('Акційний товар', (
              <select style={inputStyle} value={String(form.promotional_product)} onChange={e => setForm({...form, promotional_product: e.target.value === 'true'})}>
                <option value="false">Ні</option>
                <option value="true">Так</option>
              </select>
            ))}
            {!editUPC && form.promotional_product && field('UPC звичайного товару', <input style={inputStyle} value={form.UPC_prom} onChange={e => setForm({...form, UPC_prom: e.target.value})} />)}
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
              <th>UPC</th>
              <th>Назва</th>
              <th>Ціна</th>
              <th>Кількість</th>
              <th>Акційний</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.UPC}>
                <td>{p.UPC}</td>
                <td>{p.product_name}</td>
                <td>{p.selling_price} грн</td>
                <td>{p.products_number}</td>
                <td>{p.promotional_product ? '+' : '-'}</td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(p)}>Редагувати</button>
                  <button onClick={() => handleDelete(p.UPC)}>Видалити</button>
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