import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getCategories, createCategory, deleteCategory, updateCategory } from '../api/categories';

interface Category {
  category_number: number;
  category_name: string;
}

const field = (label: string, children: React.ReactNode) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
    <label style={{ fontSize: '0.8rem', color: '#666' }}>{label}</label>
    {children}
  </div>
);

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');

  const fetchCategories = () => {
    getCategories()
      .then((data) => {
        const mapped = data.map((row: any[]) => ({
          category_number: row[0],
          category_name: row[1],
        }));
        setCategories(mapped);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createCategory({ category_name: newName }).then(() => {
      setNewName('');
      setShowForm(false);
      fetchCategories();
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Видалити категорію?')) {
      deleteCategory(id).then(fetchCategories);
    }
  };

  const handleEdit = (c: Category) => {
    setEditId(c.category_number);
    setEditName(c.category_name);
  };

  const handleUpdate = async () => {
    if (!editId || !editName.trim()) return;
    try {
      await updateCategory(editId, { category_name: editName });
      setEditId(null);
      setEditName('');
      fetchCategories();
    } catch (err: any) {
      setError('Помилка при оновленні');
    }
  };

  const inputStyle = { padding: '0.5rem', width: '100%' };

  return (
    <Layout>
      <h1>Категорії</h1>
      <button onClick={() => setShowForm(!showForm)} style={{ marginBottom: '1rem' }}>
        {showForm ? 'Скасувати' : '+ Додати категорію'}
      </button>

      {showForm && (
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Назва категорії"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="search-input"
          />
          <button onClick={handleCreate}>Зберегти</button>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loading ? (
        <p>Завантаження...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Назва</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.category_number}>
                <td>{c.category_number}</td>
                <td>
                  {editId === c.category_number ? (
                    <input
                      style={{ ...inputStyle, width: '200px' }}
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                    />
                  ) : (
                    c.category_name
                  )}
                </td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  {editId === c.category_number ? (
                    <>
                      <button onClick={handleUpdate}>Зберегти</button>
                      <button onClick={() => { setEditId(null); setEditName(''); }}>Скасувати</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(c)}>Редагувати</button>
                      <button onClick={() => handleDelete(c.category_number)}>Видалити</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && categories.length === 0 && <p>Категорій не знайдено</p>}
    </Layout>
  );
}