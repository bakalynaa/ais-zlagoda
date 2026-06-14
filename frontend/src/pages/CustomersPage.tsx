import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getCustomers, deleteCustomer, createCustomer } from '../api/customers';

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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [percent, setPercent] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const fetchCustomers = (surname?: string, pct?: number) => {
    setLoading(true);
    getCustomers(surname, pct)
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

  const handleSearch = () => {
    fetchCustomers(search || undefined, percent ? parseInt(percent) : undefined);
  };

  const handleReset = () => {
    setSearch('');
    setPercent('');
    fetchCustomers();
  };

  const handleDelete = (cardNumber: string) => {
    if (confirm('Видалити картку клієнта?')) {
      deleteCustomer(cardNumber).then(() => fetchCustomers());
    }
  };

  const handleSubmit = async () => {
    setError('');
    try {
      await createCustomer({
        ...form,
        percent: parseInt(form.percent),
      });
      setForm(emptyForm);
      setShowForm(false);
      fetchCustomers();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((e: any) => e.msg).join(', '));
      } else {
        setError(detail || 'Помилка при додаванні');
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
        <input
          type="number"
          placeholder="% знижки"
          value={percent}
          onChange={(e) => setPercent(e.target.value)}
          style={{ width: '100px', padding: '0.5rem' }}
        />
        <button onClick={handleSearch}>Знайти</button>
        <button onClick={handleReset}>Скинути</button>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Скасувати' : '+ Додати клієнта'}
        </button>
      </div>

      {showForm && (
        <div style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <h3>Новий клієнт</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {field('Номер карти', <input style={inputStyle} value={form.card_number} onChange={e => setForm({...form, card_number: e.target.value})} />)}
            {field('Прізвище', <input style={inputStyle} value={form.cust_surname} onChange={e => setForm({...form, cust_surname: e.target.value})} />)}
            {field("Ім'я", <input style={inputStyle} value={form.cust_name} onChange={e => setForm({...form, cust_name: e.target.value})} />)}
            {field('По батькові', <input style={inputStyle} value={form.cust_patronymic} onChange={e => setForm({...form, cust_patronymic: e.target.value})} />)}
            {field('Телефон', <input style={inputStyle} value={form.phone_number} onChange={e => setForm({...form, phone_number: e.target.value})} />)}
            {field('% знижки', <input style={inputStyle} type="number" value={form.percent} onChange={e => setForm({...form, percent: e.target.value})} />)}
            {field('Місто', <input style={inputStyle} value={form.city} onChange={e => setForm({...form, city: e.target.value})} />)}
            {field('Вулиця', <input style={inputStyle} value={form.street} onChange={e => setForm({...form, street: e.target.value})} />)}
            {field('Індекс', <input style={inputStyle} value={form.zip_code} onChange={e => setForm({...form, zip_code: e.target.value})} />)}
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button onClick={handleSubmit} style={{ marginTop: '0.75rem' }}>Зберегти</button>
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
              <th>По батькові</th>
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
                <td>{c.cust_patronymic || '—'}</td>
                <td>{c.phone_number}</td>
                <td>{c.city || '—'}</td>
                <td>{c.percent}%</td>
                <td>
                  <button onClick={() => handleDelete(c.card_number)}>
                    Видалити
                  </button>
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