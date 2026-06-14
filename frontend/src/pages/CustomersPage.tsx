import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getCustomers, deleteCustomer } from '../api/customers';

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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [percent, setPercent] = useState('');

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