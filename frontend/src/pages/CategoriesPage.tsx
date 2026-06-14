import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getCategories, createCategory, deleteCategory, updateCategory } from '../api/categories';

interface Category {
  category_number: number;
  category_name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState(false);
  const [editNameError, setEditNameError] = useState(false);

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
    if (!newName.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
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
    setEditNameError(false);
  };

  const handleUpdate = async () => {
    if (!editId) return;
    if (!editName.trim()) {
      setEditNameError(true);
      return;
    }
    setEditNameError(false);
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
      <button onClick={() => { setShowForm(!showForm); setNameError(false); setNewName(''); }} style={{ marginBottom: '1rem' }}>
        {showForm ? 'Скасувати' : '+ Додати категорію'}
      </button>

      {showForm && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Назва категорії *"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setNameError(false); }}
              className="search-input"
              style={{ border: nameError ? '1px solid red' : undefined }}
            />
            <button onClick={handleCreate}>Зберегти</button>
          </div>
          {nameError && <small style={{ color: 'red' }}>Введіть назву категорії</small>}
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
                    <div>
                      <input
                        style={{ ...inputStyle, width: '200px', border: editNameError ? '1px solid red' : '1px solid #ccc' }}
                        value={editName}
                        onChange={e => { setEditName(e.target.value); setEditNameError(false); }}
                      />
                      {editNameError && <small style={{ color: 'red' }}>Введіть назву</small>}
                    </div>
                  ) : (
                    c.category_name
                  )}
                </td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  {editId === c.category_number ? (
                    <>
                      <button onClick={handleUpdate}>Зберегти</button>
                      <button onClick={() => { setEditId(null); setEditName(''); setEditNameError(false); }}>Скасувати</button>
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