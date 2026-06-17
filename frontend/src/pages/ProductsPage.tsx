import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { getProducts, createProduct, deleteProduct, updateProduct } from '../api/products';
import { getCategories } from '../api/categories';
import { useLanguage } from '../i18n/LanguageContext';

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
  const { t } = useLanguage();
  const location = useLocation();
  const isCashierView = location.pathname.startsWith('/cashier');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
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
    if (!isCashierView) {
      getCategories().then((data) => {
        setCategories(data.map((row: any[]) => ({
          category_number: row[0],
          category_name: row[1],
        })));
      }).catch(console.error);
    }
  }, [isCashierView]);

  useEffect(() => {
    if (isCashierView && products.length > 0) {
      const unique = new Map<number, string>();
      products.forEach((p) => {
        if (p.category_number != null && p.category_name) {
          unique.set(p.category_number, p.category_name);
        }
      });
      setCategories(
        [...unique.entries()].map(([category_number, category_name]) => ({
          category_number,
          category_name,
        })),
      );
    }
  }, [isCashierView, products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch = !q || p.product_name.toLowerCase().includes(q);
      const matchesCategory =
        !categoryFilter || String(p.category_number) === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter, products]);

  const handleDelete = (id: number) => {
    if (confirm(t('deleteProductConfirm'))) {
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
      setError(t('fillRequired'));
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
        setError(detail || t('errorGeneric'));
      }
    }
  };

  const pageContent = (
    <>
      <div className={isCashierView ? 'manager-page-header' : undefined}>
        <h1>{t('productsTitle')}</h1>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          className="search-input"
          type="text"
          placeholder={t('searchByName')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {categories.length > 0 && (
          <select
            className="manager-field-input"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">{t('category')}</option>
            {categories.map((c) => (
              <option key={c.category_number} value={c.category_number}>
                {c.category_name}
              </option>
            ))}
          </select>
        )}
        {!isCashierView && (
          <button onClick={() => { setEditId(null); setForm(emptyForm); setShowForm(!showForm); setError(''); setTouched({}); }}>
            {showForm && !editId ? t('cancel') : t('addProduct')}
          </button>
        )}
      </div>

      {!isCashierView && showForm && (
        <div style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <h3>{editId ? t('editProduct') : t('newProduct')}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {field(t('category'), (
              <select style={inputStyle('category_number')} value={form.category_number} onChange={e => setForm({...form, category_number: e.target.value})}>
                <option value="">{t('selectCategory')}</option>
                {categories.map(c => (
                  <option key={c.category_number} value={c.category_number}>{c.category_name}</option>
                ))}
              </select>
            ), true)}
            {field(t('name'), <input style={inputStyle('product_name')} value={form.product_name} onChange={e => setForm({...form, product_name: e.target.value})} />, true)}
            {field(t('manufacturer'), <input style={inputStyle('manufacturer')} value={form.manufacturer} onChange={e => setForm({...form, manufacturer: e.target.value})} />, true)}
            {field(t('characteristics'), <input style={inputStyle('characteristics')} value={form.characteristics} onChange={e => setForm({...form, characteristics: e.target.value})} />, true)}
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button onClick={handleSubmit}>{t('save')}</button>
            <button onClick={handleCancel}>{t('cancel')}</button>
          </div>
        </div>
      )}

      {loading ? (
        <p>{t('loading')}</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t('name')}</th>
              <th>{t('manufacturer')}</th>
              <th>{t('characteristics')}</th>
              <th>{t('category')}</th>
              {!isCashierView && <th>{t('actions')}</th>}
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
                {!isCashierView && (
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEdit(p)}>{t('edit')}</button>
                    <button onClick={() => handleDelete(p.id_product)}>{t('delete')}</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && filtered.length === 0 && <p>{t('productsEmpty')}</p>}
    </>
  );

  return (
    <Layout>
      {isCashierView ? <section className="manager-page">{pageContent}</section> : pageContent}
    </Layout>
  );
}