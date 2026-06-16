import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getChecks, getCheck } from '../api/checks';
import { useLanguage } from '../i18n/LanguageContext';

interface Check {
  check_number: string;
  id_employee: string;
  card_number: string | null;
  print_date: string;
  sum_total: number;
  vat: number;
}

export default function CashierChecksPage() {
  const { t, dateLocale } = useLanguage();
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCheck, setSelectedCheck] = useState<{ check: unknown[]; items: unknown[][] } | null>(null);

  const fetchChecks = () => {
    setLoading(true);
    getChecks(undefined, dateFrom || undefined, dateTo || undefined)
      .then((data) => {
        const mapped = data.map((row: unknown[]) => ({
          check_number: row[0] as string,
          id_employee: row[1] as string,
          card_number: row[2] as string | null,
          print_date: row[3] as string,
          sum_total: row[4] as number,
          vat: row[5] as number,
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
      <section className="manager-page">
        <div className="manager-page-header">
          <h1>{t('routeMyChecks')}</h1>
        </div>

        <div className="manager-inline-form">
          <label>{t('from')} <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></label>
          <label>{t('to')} <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></label>
          <button type="button" onClick={fetchChecks}>{t('filter')}</button>
          <button type="button" onClick={() => { setDateFrom(''); setDateTo(''); fetchChecks(); }}>{t('reset')}</button>
        </div>

        {selectedCheck && (
          <div style={{ border: '1px solid var(--border-soft)', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
            <h3>{t('checkDetails', { number: String(selectedCheck.check[0]) })}</h3>
            <p>
              {t('checkDetailsSimple', {
                date: String(selectedCheck.check[3]),
                sum: String(selectedCheck.check[4]),
                vat: String(selectedCheck.check[5]),
                currency: t('currency'),
              })}
            </p>
            <div className="manager-table-wrap">
              <table className="manager-table data-table">
                <thead>
                  <tr><th>UPC</th><th>{t('name')}</th><th>{t('quantity')}</th><th>{t('price')}</th></tr>
                </thead>
                <tbody>
                  {selectedCheck.items.map((item, i) => (
                    <tr key={i}>
                      <td>{item[0] as string}</td>
                      <td>{item[1] as string}</td>
                      <td>{item[2] as number}</td>
                      <td>{item[3] as number} {t('currency')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={() => setSelectedCheck(null)}>{t('closeModal')}</button>
          </div>
        )}

        {loading ? (
          <p className="manager-status">{t('loading')}</p>
        ) : (
          <div className="manager-table-wrap">
            <table className="manager-table data-table">
              <thead>
                <tr>
                  <th>{t('checkNumber')}</th>
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
                    <td>{new Date(c.print_date).toLocaleString(dateLocale)}</td>
                    <td>{c.sum_total} {t('currency')}</td>
                    <td>{c.vat} {t('currency')}</td>
                    <td>
                      <button type="button" className="manager-action-btn manager-action-btn--ghost" onClick={() => handleView(c.check_number)}>
                        {t('view')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && checks.length === 0 && <p className="manager-empty">{t('checksEmpty')}</p>}
      </section>
    </Layout>
  );
}
