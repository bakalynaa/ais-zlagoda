import { useState } from 'react';
import Layout from '../components/Layout';
import { apiClient } from '../api/client';
import { useLanguage } from '../i18n/LanguageContext';

export default function StatisticsPage() {
  const { t } = useLanguage();
  const [cashierId, setCashierId] = useState('');
  const [upc, setUpc] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchCashierTotal = async () => {
    if (!cashierId || !dateFrom || !dateTo) return;
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/statistics/cashier-total?cashier_id=${cashierId}&date_from=${dateFrom}&date_to=${dateTo}`);
      setResult({ type: 'cashier', ...data });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTotal = async () => {
    if (!dateFrom || !dateTo) return;
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/statistics/all-total?date_from=${dateFrom}&date_to=${dateTo}`);
      setResult({ type: 'all', ...data });
    } finally {
      setLoading(false);
    }
  };

  const fetchProductCount = async () => {
    if (!upc || !dateFrom || !dateTo) return;
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/statistics/product-count?upc=${upc}&date_from=${dateFrom}&date_to=${dateTo}`);
      setResult({ type: 'product', ...data });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1>{t('statisticsTitle')}</h1>

      <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
        <h2>{t('period')}</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label>{t('from')} <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></label>
          <label>{t('to')} <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></label>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
          <h3>{t('cashierSales')}</h3>
          <input
            type="text"
            placeholder={t('cashierIdPlaceholder')}
            value={cashierId}
            onChange={(e) => setCashierId(e.target.value)}
            style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
          />
          <button onClick={fetchCashierTotal} style={{ width: '100%' }}>{t('get')}</button>
        </div>

        <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
          <h3>{t('allCashierSales')}</h3>
          <button onClick={fetchAllTotal} style={{ width: '100%', marginTop: '2.5rem' }}>{t('get')}</button>
        </div>

        <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
          <h3>{t('productCount')}</h3>
          <input
            type="text"
            placeholder={t('upcPlaceholder')}
            value={upc}
            onChange={(e) => setUpc(e.target.value)}
            style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
          />
          <button onClick={fetchProductCount} style={{ width: '100%' }}>{t('get')}</button>
        </div>
      </div>

      {loading && <p>{t('loading')}</p>}

      {result && !loading && (
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', background: '#f9f9f9' }}>
          {result.type === 'cashier' && (
            <p>{t('cashierTotalResult', { id: result.cashier_id, total: result.total })}</p>
          )}
          {result.type === 'all' && (
            <p>{t('allTotalResult', { total: result.total })}</p>
          )}
          {result.type === 'product' && (
            <p>{t('productSoldResult', { upc: result.upc, count: result.total_sold })}</p>
          )}
        </div>
      )}
    </Layout>
  );
}
