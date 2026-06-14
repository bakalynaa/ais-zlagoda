import { useEffect, useState } from 'react';
import CityInput from '../components/CityInput';
import Layout from '../components/Layout';
import { getCustomers, createCustomer, updateCustomer } from '../api/customers';

interface Customer {
  card_number: string;
  cust_surname: string;
  cust_name: string;
  cust_patronymic: string | null;
  phone_number: string;
  city: string | null;
  street: string | null;
  zip_code: string | null;
  percent: number;
}

const emptyForm = {
  card_number: '',
  cust_surname: '',
  cust_name: '',
  cust_patronymic: '',
  phone_number: '',
  city: '',
  street: '',
  zip_code: '',
  percent: '',
};

const field = (label: string, children: React.ReactNode) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
    <label style={{ fontSize: '0.8rem', color: '#666' }}>{label}</label>
    {children}
  </div>
);

export default function CashierCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const fetchCustomers = (surname?: string) => {
    setLoading(true);
    getCustomers(surname)
      .then((data) => {
        const mapped = data.map((row: any[]) => ({
          card_number: row[0],
          cust_surname: row[1],
          cust_name: row[2],
          cust_patronymic: row[3],
          phone_number: row[4],
          city: row[5],
          street: row[6],
          zip_code: row[7],
          percent: row[8],
        }));
        setCustomers(mapped);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleEdit = (c: Customer) => {
    setEditId(c.card_number);
    setForm({
      card_number: c.card_number,
      cust_surname: c.cust_surname,
      cust_name: c.cust_name,
      cust_patronymic: c.cust_patronymic || '',
      phone_number: c.phone_number,
      city: c.city || '',
      street: c.street || '',
      zip_code: c.zip_code || '',
      percent: String(c.percent),
    });
    setShowForm(true);
    setError('');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    try {
      if (editId) {
        await updateCustomer(editId, {
          cust_surname: form.cust_surname,
          cust_name: form.cust_name,
          cust_patronymic: form.cust_patronymic || null,
          phone_number: form.phone_number,
          city: form.city || null,
          street: form.street || null,
          zip_code: form.zip_code || null,
          percent: parseInt(form.percent),
        });
      } else {
        await createCustomer({
          ...form,
          percent: parseInt(form.percent),
        });
      }
      handleCancel();
      fetchCustomers();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((e: any) => e.msg).join(', '));
      } else {
        setError(detail || 'Помилка');
      }
    }
  };

  const inputStyle = { padding: '0.5rem', width: '100%' };

  return (
    <Layout>
      <h1>Клієнти</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          className="search-input"
          type="text"
          placeholder="Пошук за прізвищем..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => fetchCustomers(search || undefined)}>Знайти</button>
        <button onClick={() => { setSearch(''); fetchCustomers(); }}>Скинути</button>
        <button onClick={() => { setEditId(null); setForm(emptyForm); setShowForm(!showForm); setError(''); }}>
          {showForm && !editId ? 'Скасувати' : '+ Додати клієнта'}
        </button>
      </div>

      {showForm && (
        <div style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <h3>{editId ? 'Редагувати клієнта' : 'Новий клієнт'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {!editId && field('Номер карти', <input style={inputStyle} value={form.card_number} onChange={e => setForm({...form, card_number: e.target.value})} />)}
            {field('Прізвище', <input style={inputStyle} value={form.cust_surname} onChange={e => setForm({...form, cust_surname: e.target.value})} />)}
            {field("Ім'я", <input style={inputStyle} value={form.cust_name} onChange={e => setForm({...form, cust_name: e.target.value})} />)}
            {field('По батькові', <input style={inputStyle} value={form.cust_patronymic} onChange={e => setForm({...form, cust_patronymic: e.target.value})} />)}
            {field('Телефон', <input style={inputStyle} value={form.phone_number} onChange={e => setForm({...form, phone_number: e.target.value})} />)}
            {field('% знижки', <input style={inputStyle} type="number" value={form.percent} onChange={e => setForm({...form, percent: e.target.value})} />)}
            {field('Місто', <CityInput style={inputStyle} value={form.city} onChange={val => setForm({...form, city: val})} />)}
            {field('Вулиця', <input style={inputStyle} value={form.street} onChange={e => setForm({...form, street: e.target.value})} />)}
            {field('Індекс', <input style={inputStyle} value={form.zip_code} onChange={e => setForm({...form, zip_code: e.target.value})} />)}
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
              <th>Номер карти</th>
              <th>Прізвище</th>
              <th>Ім'я</th>
              <th>Телефон</th>
              <th>Місто</th>
              <th>Знижка</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.card_number}>
                <td>{c.card_number}</td>
                <td>{c.cust_surname}</td>
                <td>{c.cust_name}</td>
                <td>{c.phone_number}</td>
                <td>{c.city || '—'}</td>
                <td>{c.percent}%</td>
                <td>
                  <button onClick={() => handleEdit(c)}>Редагувати</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && customers.length === 0 && <p>Клієнтів не знайдено</p>}
    </Layout>
  );
}