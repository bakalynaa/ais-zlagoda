import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { getEmployees } from '../api/employees';
import { getCategories } from '../api/categories';
import { getCustomers } from '../api/customers';
import { getProducts } from '../api/products';
import { getStoreProducts } from '../api/store_products';
import { getChecks } from '../api/checks';
import { useLanguage } from '../i18n/LanguageContext';
import type { TranslationKey } from '../i18n/translations';

type ReportType = 'employees' | 'categories' | 'customers' | 'products' | 'store_products' | 'checks';

const reportLabelKeys: Record<ReportType, TranslationKey> = {
  employees: 'reportEmployees',
  categories: 'routeCategories',
  customers: 'routeCustomers',
  products: 'routeProducts',
  store_products: 'routeStoreProducts',
  checks: 'routeChecks',
};

export default function ReportsPage() {
  const { t, dateLocale } = useLanguage();
  const [reportType, setReportType] = useState<ReportType>('employees');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const reportLabels = useMemo(
    () =>
      Object.fromEntries(
        (Object.keys(reportLabelKeys) as ReportType[]).map((type) => [type, t(reportLabelKeys[type])]),
      ) as Record<ReportType, string>,
    [t],
  );

  const headers = useMemo<Record<ReportType, string[]>>(
    () => ({
      employees: ['ID', t('surname'), t('firstName'), t('patronymic'), t('reportRole'), t('reportSalary'), t('reportBirthDate'), t('reportStartDate'), t('phone'), t('city'), t('street'), t('zipCode')],
      categories: ['ID', t('name')],
      customers: [t('cardNumber'), t('surname'), t('firstName'), t('patronymic'), t('phone'), t('city'), t('street'), t('zipCode'), t('discount')],
      products: ['ID', t('name'), t('manufacturer'), t('characteristics')],
      store_products: ['UPC', t('reportUpcProm'), t('price'), t('quantity'), t('promotional'), t('name')],
      checks: [t('checkNumber'), t('cashier'), t('card'), t('date'), t('sum'), t('vat')],
    }),
    [t],
  );

  const fetchData = async (type: ReportType) => {
    setLoading(true);
    try {
      let result;
      if (type === 'employees') result = await getEmployees();
      else if (type === 'categories') result = await getCategories();
      else if (type === 'customers') result = await getCustomers();
      else if (type === 'products') result = await getProducts();
      else if (type === 'store_products') result = await getStoreProducts();
      else if (type === 'checks') result = await getChecks();
      setData(result || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(reportType);
  }, [reportType]);

  return (
    <Layout>
      <div className="no-print">
        <h1>{t('reportsTitle')}</h1>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {(Object.keys(reportLabels) as ReportType[]).map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              style={{ fontWeight: reportType === type ? 'bold' : 'normal' }}
            >
              {reportLabels[type]}
            </button>
          ))}
        </div>
        <button onClick={() => window.print()} style={{ marginBottom: '1rem' }}>
          {t('print')}
        </button>
      </div>

      <div id="print-area">
        <h2 style={{ textAlign: 'center' }}>{t('reportTitle', { name: reportLabels[reportType] })}</h2>
        <p style={{ textAlign: 'center' }}>
          {t('generatedDate', { date: new Date().toLocaleDateString(dateLocale) })}
        </p>

        {loading ? (
          <p>{t('loading')}</p>
        ) : (
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                {headers[reportType].map((h) => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  {(Array.isArray(row) ? row : Object.values(row)).slice(0, headers[reportType].length).map((cell: any, j: number) => (
                    <td key={j}>{cell === null ? t('dash') : String(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>{t('signature')}</span>
          <span>{t('signatureDate')}</span>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .layout-header { display: none !important; }
          .sidebar { display: none !important; }
          .layout-content { margin: 0 !important; padding: 0 !important; }
          body { margin: 0; }
        }
      `}</style>
    </Layout>
  );
}
