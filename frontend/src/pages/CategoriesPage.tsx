import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getCategories, createCategory, deleteCategory, updateCategory } from '../api/categories';
import { useLanguage } from '../i18n/LanguageContext';

interface Category {
  category_number: number;
  category_name: string;
}

export default function CategoriesPage() {
  const { t } = useLanguage();
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
        const mapped = data.map((row: unknown[]) => ({
          category_number: row[0] as number,
          category_name: row[1] as string,
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
    if (confirm(t('deleteCategoryConfirm'))) {
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
    } catch {
      setError(t('categoryUpdateError'));
    }
  };

  return (
    <Layout>
      <section className="manager-page">
        <div className="manager-page-header">
          <h1>{t('categoriesTitle')}</h1>
          <button
            type="button"
            className={`manager-action-btn ${showForm ? 'manager-action-btn--ghost' : 'manager-action-btn--primary'}`}
            onClick={() => {
              setShowForm(!showForm);
              setNameError(false);
              setNewName('');
            }}
          >
            {showForm ? t('cancel') : t('addCategory')}
          </button>
        </div>

        {showForm && (
          <div className="manager-inline-form">
            <input
              type="text"
              placeholder={t('categoryName')}
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setNameError(false);
              }}
              className={`manager-field-input ${nameError ? 'is-error' : ''}`}
            />
            <button type="button" className="manager-action-btn manager-action-btn--primary" onClick={handleCreate}>
              {t('save')}
            </button>
            {nameError && <p className="manager-field-error">{t('enterCategoryName')}</p>}
          </div>
        )}

        {error && <p className="manager-field-error">{error}</p>}

        {loading ? (
          <p className="manager-status">{t('loading')}</p>
        ) : categories.length === 0 ? (
          <p className="manager-empty">{t('categoriesEmpty')}</p>
        ) : (
          <div className="manager-table-wrap">
            <table className="manager-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{t('name')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.category_number}>
                    <td>{c.category_number}</td>
                    <td>
                      {editId === c.category_number ? (
                        <div className="manager-inline-edit">
                          <input
                            className={`manager-field-input ${editNameError ? 'is-error' : ''}`}
                            value={editName}
                            onChange={(e) => {
                              setEditName(e.target.value);
                              setEditNameError(false);
                            }}
                          />
                          {editNameError && <small className="manager-field-error">{t('enterName')}</small>}
                        </div>
                      ) : (
                        c.category_name
                      )}
                    </td>
                    <td>
                      <div className="manager-row-actions">
                        {editId === c.category_number ? (
                          <>
                            <button type="button" className="manager-action-btn manager-action-btn--primary" onClick={handleUpdate}>
                              {t('save')}
                            </button>
                            <button
                              type="button"
                              className="manager-action-btn manager-action-btn--ghost"
                              onClick={() => {
                                setEditId(null);
                                setEditName('');
                                setEditNameError(false);
                              }}
                            >
                              {t('cancel')}
                            </button>
                          </>
                        ) : (
                          <>
                            <button type="button" className="manager-action-btn manager-action-btn--ghost" onClick={() => handleEdit(c)}>
                              {t('edit')}
                            </button>
                            <button type="button" className="manager-action-btn manager-action-btn--danger" onClick={() => handleDelete(c.category_number)}>
                              {t('delete')}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </Layout>
  );
}
