import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getCategories, createCategory, deleteCategory } from '../api/categories';

interface Category {
  category_number: number;
  category_name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [showForm, setShowForm] = useState(false);

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

  return (
    <Layout>
      <h1>Категорії</h1>
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Скасувати' : '+ Додати категорію'}
      </button>
      {showForm && (
        <div style={{ margin: '1rem 0' }}>
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
                <td>{c.category_name}</td>
                <td>
                  <button onClick={() => handleDelete(c.category_number)}>
                    Видалити
                  </button>
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