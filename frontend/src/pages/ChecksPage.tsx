import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getChecks, getCheck, deleteCheck } from '../api/checks';
import { useLanguage } from '../i18n/LanguageContext';

interface Check {
  check_number: string;
  id_employee: string;
  card_number: string | null;
  print_date: string;
  sum_total: number;
  vat: number;
}

interface CheckDetail {
  check: any[];
  items: any[][];
}

export default function ChecksPage() {
  const { t, dateLocale } = useLanguage();
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCheck, setSelectedCheck] = useState<CheckDetail | null>(null);

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

  const handleDelete = (checkNumber: string) => {
    if (confirm(t('deleteCheckConfirm'))) {
      deleteCheck(checkNumber).then(fetchChecks);
    }
  };

  const handleView = (checkNumber: string) => {
    getCheck(checkNumber).then((data) => setSelectedCheck(data));
  };

  return (
    <Layout>
      <h1>{t('checksTitle')}</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
        <label>{t('from')} <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></label>
        <label>{t('to')} <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></label>
        <button onClick={fetchChecks}>{t('filter')}</button>
        <button onClick={() => { setDateFrom(''); setDateTo(''); fetchChecks(); }}>{t('reset')}</button>
      </div>

      {selectedCheck && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
          <h3>{t('checkDetails', { number: selectedCheck.check[0] })}</h3>
          <p>
            {t('checkDetailsLine', {
              cashier: selectedCheck.check[1],
              date: selectedCheck.check[3],
              sum: selectedCheck.check[4],
              vat: selectedCheck.check[5],
            })}
          </p>
          <table className="data-table">
            <thead>
              <tr><th>UPC</th><th>{t('name')}</th><th>{t('quantity')}</th><th>{t('price')}</th></tr>
            </thead>
            <tbody>
              {selectedCheck.items.map((item, i) => (
                <tr key={i}>
                  <td>{item[0]}</td>
                  <td>{item[1]}</td>
                  <td>{item[2]}</td>
                  <td>{item[3]} {t('currency')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setSelectedCheck(null)}>{t('closeModal')}</button>
        </div>
      )}

      {loading ? (
        <p>{t('loading')}</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('checkNumber')}</th>
              <th>{t('cashier')}</th>
              <th>{t('date')}</th>
              <th>{t('sum')}</th>
              <th>{t('vat')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {checks.map((c) => (
              <tr key={c.check_number}>
                <td>{c.check_number}</td>
                <td>{c.id_employee}</td>
                <td>{new Date(c.print_date).toLocaleString(dateLocale)}</td>
                <td>{c.sum_total} {t('currency')}</td>
                <td>{c.vat} {t('currency')}</td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleView(c.check_number)}>{t('view')}</button>
                  <button onClick={() => handleDelete(c.check_number)}>{t('delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && checks.length === 0 && <p>{t('checksEmpty')}</p>}
    </Layout>
  );
}
