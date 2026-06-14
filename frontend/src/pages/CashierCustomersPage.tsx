import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getCustomers } from '../api/customers';

interface Customer {
  card_number: string;
  cust_surname: string;
  cust_name: string;
  cust_patronymic: string | null;
  phone_number: string;
  city: string | null;
  percent: number;
}

export default function CashierCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
      </div>
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && customers.length === 0 && <p>Клієнтів не знайдено</p>}
    </Layout>
  );
}