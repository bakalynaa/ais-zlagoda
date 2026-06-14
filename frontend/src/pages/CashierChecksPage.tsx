import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getChecks, getCheck } from '../api/checks';

interface Check {
  check_number: string;
  id_employee: string;
  card_number: string | null;
  print_date: string;
  sum_total: number;
  vat: number;
}

export default function CashierChecksPage() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCheck, setSelectedCheck] = useState<any>(null);

  const fetchChecks = () => {
    setLoading(true);
    getChecks(undefined, dateFrom || undefined, dateTo || undefined)
      .then((data) => {
        const mapped = data.map((row: any[]) => ({
          check_number: row[0],
          id_employee: row[1],
          card_number: row[2],
          print_date: row[3],
          sum_total: row[4],
          vat: row[5],
        }));
        setChecks(mapped);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchChecks();
  }, []);

  const handleView = (checkNumber: string) => {
    getCheck(checkNumber).then((data) => setSelectedCheck(data));
  };

  return (
    <Layout>
      <h1>Мої чеки</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
        <label>З: <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></label>
        <label>По: <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></label>
        <button onClick={fetchChecks}>Фільтрувати</button>
        <button onClick={() => { setDateFrom(''); setDateTo(''); fetchChecks(); }}>Скинути</button>
      </div>

      {selectedCheck && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
          <h3>Деталі чека {selectedCheck.check[0]}</h3>
          <p>Дата: {selectedCheck.check[3]} | Сума: {selectedCheck.check[4]} грн | ПДВ: {selectedCheck.check[5]} грн</p>
          <table className="data-table">
            <thead>
              <tr><th>UPC</th><th>Назва</th><th>Кількість</th><th>Ціна</th></tr>
            </thead>
            <tbody>
              {selectedCheck.items.map((item: any[], i: number) => (
                <tr key={i}>
                  <td>{item[0]}</td>
                  <td>{item[1]}</td>
                  <td>{item[2]}</td>
                  <td>{item[3]} грн</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setSelectedCheck(null)}>Закрити</button>
        </div>
      )}

      {loading ? (
        <p>Завантаження...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Номер чека</th>
              <th>Дата</th>
              <th>Сума</th>
              <th>ПДВ</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {checks.map((c) => (
              <tr key={c.check_number}>
                <td>{c.check_number}</td>
                <td>{new Date(c.print_date).toLocaleString('uk-UA')}</td>
                <td>{c.sum_total} грн</td>
                <td>{c.vat} грн</td>
                <td>
                  <button onClick={() => handleView(c.check_number)}>Переглянути</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && checks.length === 0 && <p>Чеків не знайдено</p>}
    </Layout>
  );
}