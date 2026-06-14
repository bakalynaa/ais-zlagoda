import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getEmployees } from '../api/employees';
import { getCategories } from '../api/categories';
import { getCustomers } from '../api/customers';
import { getProducts } from '../api/products';
import { getStoreProducts } from '../api/store_products';
import { getChecks } from '../api/checks';

type ReportType = 'employees' | 'categories' | 'customers' | 'products' | 'store_products' | 'checks';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('employees');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const reportLabels: Record<ReportType, string> = {
    employees: 'Працівники',
    categories: 'Категорії',
    customers: 'Клієнти',
    products: 'Товари',
    store_products: 'Товари в магазині',
    checks: 'Чеки',
  };

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

  const headers: Record<ReportType, string[]> = {
    employees: ['ID', 'Прізвище', "Ім'я", 'По батькові', 'Роль', 'Зарплата', 'Дата народження', 'Дата початку', 'Телефон', 'Місто', 'Вулиця', 'Індекс'],
    categories: ['ID', 'Назва'],
    customers: ['Номер карти', 'Прізвище', "Ім'я", 'По батькові', 'Телефон', 'Місто', 'Вулиця', 'Індекс', 'Знижка'],
    products: ['ID', 'Назва', 'Виробник', 'Характеристики'],
    store_products: ['UPC', 'UPC акц.', 'Ціна', 'Кількість', 'Акційний', 'Назва'],
    checks: ['Номер чека', 'Касир', 'Карта', 'Дата', 'Сума', 'ПДВ'],
  };

  return (
    <Layout>
      <div className="no-print">
        <h1>Звіти</h1>
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
          Друкувати
        </button>
      </div>

      <div id="print-area">
        <h2 style={{ textAlign: 'center' }}>Звіт: {reportLabels[reportType]}</h2>
        <p style={{ textAlign: 'center' }}>Дата формування: {new Date().toLocaleDateString('uk-UA')}</p>

        {loading ? (
          <p>Завантаження...</p>
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
                    <td key={j}>{cell === null ? '—' : String(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>Підпис: _______________</span>
          <span>Дата: _______________</span>
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