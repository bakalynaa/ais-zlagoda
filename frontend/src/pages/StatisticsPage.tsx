import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Layout from '../components/Layout';
import { apiClient } from '../api/client';
import { getCategories } from '../api/categories';
import {
  getSalesByCategory,
  getCashiersSoldAllInCategory,
  getStoreStatsByCategory,
  getCategoriesFullyStocked,
  getCategorySalesSummary,
  getProductsSoldByAllCashiers,
} from '../api/reports';
import { useLanguage } from '../i18n/LanguageContext';
import type { TranslationKey } from '../i18n/translations';

const MAX_ROWS = 5;

interface ColumnDef {
  key: string;
  labelKey: TranslationKey;
}

interface QueryBlockProps {
  titleKey: TranslationKey;
  descKey: TranslationKey;
  columns: ColumnDef[];
  params?: ReactNode;
  onRun: () => Promise<Record<string, unknown>[]>;
  validate?: () => string | null;
}

function QueryBlock({ titleKey, descKey, columns, params, onRun, validate }: QueryBlockProps) {
  const { t } = useLanguage();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ran, setRan] = useState(false);

  const handleRun = async () => {
    const validationError = validate?.();
    if (validationError) {
      setError(validationError);
      setRows([]);
      setRan(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await onRun();
      setRows(data.slice(0, MAX_ROWS));
      setRan(true);
    } catch {
      setError(t('errorGeneric'));
      setRows([]);
      setRan(true);
    } finally {
      setLoading(false);
    }
  };

  const columnLabels = useMemo(
    () => columns.map((c) => ({ ...c, label: t(c.labelKey) })),
    [columns, t],
  );

  return (
    <article className="team-query-block">
      <h4>{t(titleKey)}</h4>
      <p className="team-query-desc">{t(descKey)}</p>
      {params && <div className="team-query-params">{params}</div>}
      <button type="button" className="manager-action-btn manager-action-btn--primary" onClick={handleRun}>
        {t('runReport')}
      </button>
      {loading && <p className="team-query-status">{t('loading')}</p>}
      {error && <p className="team-query-error">{error}</p>}
      {!loading && rows.length > 0 && (
        <div className="manager-table-wrap team-query-table-wrap">
          <table className="manager-table data-table">
            <thead>
              <tr>
                {columnLabels.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {row[col.key] === null || row[col.key] === undefined
                        ? t('dash')
                        : String(row[col.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length >= MAX_ROWS && (
            <p className="team-query-limit">{t('queryRowsLimit', { count: MAX_ROWS })}</p>
          )}
        </div>
      )}
      {!loading && !error && ran && rows.length === 0 && (
        <p className="team-query-empty">{t('reportEmptyHint')}</p>
      )}
    </article>
  );
}

interface TeamSectionProps {
  titleKey: TranslationKey;
  children: ReactNode;
}

function TeamSection({ titleKey, children }: TeamSectionProps) {
  const { t } = useLanguage();
  return (
    <section className="team-queries-section">
      <h3>{t(titleKey)}</h3>
      <div className="team-queries-grid">{children}</div>
    </section>
  );
}

export default function StatisticsPage() {
  const { t } = useLanguage();
  const [cashierId, setCashierId] = useState('');
  const [upc, setUpc] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const [categoryOptions, setCategoryOptions] = useState<{ id: number; name: string }[]>([]);
  const [anastasiaCategory, setAnastasiaCategory] = useState('1');
  const [dariaCategory, setDariaCategory] = useState('1');
  const [dariaDateFrom, setDariaDateFrom] = useState('2026-01-01');
  const [dariaDateTo, setDariaDateTo] = useState('2026-12-31');
  const [artemMinRevenue, setArtemMinRevenue] = useState('200');

  useEffect(() => {
    getCategories()
      .then((rows) => {
        const mapped = rows.map((row: unknown[]) => ({
          id: row[0] as number,
          name: row[1] as string,
        }));
        setCategoryOptions(mapped);
        if (mapped.length > 0) {
          const first = String(mapped[0].id);
          setAnastasiaCategory(first);
          setDariaCategory(first);
        }
      })
      .catch(console.error);
  }, []);

  const categorySelect = (value: string, onChange: (v: string) => void) => (
    <label>
      {t('reportCategoryId')}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {categoryOptions.map((c) => (
          <option key={c.id} value={c.id}>{c.id} — {c.name}</option>
        ))}
      </select>
    </label>
  );

  const fetchCashierTotal = async () => {
    if (!cashierId || !dateFrom || !dateTo) return;
    setLoading(true);
    try {
      const { data } = await apiClient.get(
        `/statistics/cashier-total?cashier_id=${cashierId}&date_from=${dateFrom}&date_to=${dateTo}`,
      );
      setResult({ type: 'cashier', ...data });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTotal = async () => {
    if (!dateFrom || !dateTo) return;
    setLoading(true);
    try {
      const { data } = await apiClient.get(
        `/statistics/all-total?date_from=${dateFrom}&date_to=${dateTo}`,
      );
      setResult({ type: 'all', ...data });
    } finally {
      setLoading(false);
    }
  };

  const fetchProductCount = async () => {
    if (!upc || !dateFrom || !dateTo) return;
    setLoading(true);
    try {
      const { data } = await apiClient.get(
        `/statistics/product-count?upc=${upc}&date_from=${dateFrom}&date_to=${dateTo}`,
      );
      setResult({ type: 'product', ...data });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="manager-page statistics-page">
        <h1>{t('statisticsTitle')}</h1>

        <div className="statistics-panel">
          <h2>{t('period')}</h2>
          <div className="statistics-period-row">
            <label>{t('from')} <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} /></label>
            <label>{t('to')} <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} /></label>
          </div>
        </div>

        <div className="statistics-grid">
          <div className="statistics-panel">
            <h3>{t('cashierSales')}</h3>
            <input
              type="text"
              className="manager-field-input"
              placeholder={t('cashierIdPlaceholder')}
              value={cashierId}
              onChange={(e) => setCashierId(e.target.value)}
            />
            <button type="button" className="manager-action-btn" onClick={fetchCashierTotal}>{t('get')}</button>
          </div>

          <div className="statistics-panel">
            <h3>{t('allCashierSales')}</h3>
            <button type="button" className="manager-action-btn" onClick={fetchAllTotal}>{t('get')}</button>
          </div>

          <div className="statistics-panel">
            <h3>{t('productCount')}</h3>
            <input
              type="text"
              className="manager-field-input"
              placeholder={t('upcPlaceholder')}
              value={upc}
              onChange={(e) => setUpc(e.target.value)}
            />
            <button type="button" className="manager-action-btn" onClick={fetchProductCount}>{t('get')}</button>
          </div>
        </div>

        {loading && <p>{t('loading')}</p>}

        {result && !loading && (
          <div className="statistics-result">
            {result.type === 'cashier' && (
              <p>{t('cashierTotalResult', { id: String(result.cashier_id), total: String(result.total) })}</p>
            )}
            {result.type === 'all' && (
              <p>{t('allTotalResult', { total: String(result.total) })}</p>
            )}
            {result.type === 'product' && (
              <p>{t('productSoldResult', { upc: String(result.upc), count: String(result.total_sold) })}</p>
            )}
          </div>
        )}

        <hr className="statistics-divider" />

        <h2>{t('individualQueriesTitle')}</h2>
        <p className="statistics-queries-intro">{t('individualQueriesIntro')}</p>

        <TeamSection titleKey="queriesAnastasia">
          <QueryBlock
            titleKey="anastasiaQ1Title"
            descKey="anastasiaQ1Desc"
            columns={[
              { key: 'category_name', labelKey: 'category' },
              { key: 'positions_count', labelKey: 'reportPositionsCount' },
              { key: 'total_units', labelKey: 'reportTotalUnits' },
            ]}
            params={categorySelect(anastasiaCategory, setAnastasiaCategory)}
            onRun={() => getStoreStatsByCategory(parseInt(anastasiaCategory, 10))}
          />
          <QueryBlock
            titleKey="anastasiaQ2Title"
            descKey="anastasiaQ2Desc"
            columns={[
              { key: 'category_number', labelKey: 'reportCategoryId' },
              { key: 'category_name', labelKey: 'category' },
            ]}
            onRun={() => getCategoriesFullyStocked()}
          />
        </TeamSection>

        <TeamSection titleKey="queriesDaria">
          <QueryBlock
            titleKey="dariaQ1Title"
            descKey="dariaQ1Desc"
            columns={[
              { key: 'product_name', labelKey: 'name' },
              { key: 'category_name', labelKey: 'category' },
              { key: 'total_sold', labelKey: 'reportTotalSold' },
            ]}
            params={
              <>
                {categorySelect(dariaCategory, setDariaCategory)}
                <label>{t('from')} <input type="date" value={dariaDateFrom} onChange={(e) => setDariaDateFrom(e.target.value)} /></label>
                <label>{t('to')} <input type="date" value={dariaDateTo} onChange={(e) => setDariaDateTo(e.target.value)} /></label>
              </>
            }
            onRun={() => getSalesByCategory(parseInt(dariaCategory, 10), dariaDateFrom, dariaDateTo)}
            validate={() => (!dariaDateFrom || !dariaDateTo ? t('reportDatesRequired') : null)}
          />
          <QueryBlock
            titleKey="dariaQ2Title"
            descKey="dariaQ2Desc"
            columns={[
              { key: 'id_employee', labelKey: 'reportEmployeeId' },
              { key: 'empl_surname', labelKey: 'surname' },
              { key: 'empl_name', labelKey: 'firstName' },
            ]}
            params={categorySelect(dariaCategory, setDariaCategory)}
            onRun={() => getCashiersSoldAllInCategory(parseInt(dariaCategory, 10))}
          />
        </TeamSection>

        <TeamSection titleKey="queriesArtem">
          <QueryBlock
            titleKey="artemQ1Title"
            descKey="artemQ1Desc"
            columns={[
              { key: 'category_name', labelKey: 'category' },
              { key: 'sale_lines', labelKey: 'reportSaleLines' },
              { key: 'total_units', labelKey: 'reportTotalUnits' },
              { key: 'total_revenue', labelKey: 'reportTotalRevenue' },
            ]}
            params={
              <label>
                {t('reportMinRevenue')}
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="manager-field-input"
                  value={artemMinRevenue}
                  onChange={(e) => setArtemMinRevenue(e.target.value)}
                />
              </label>
            }
            onRun={() => getCategorySalesSummary(parseFloat(artemMinRevenue) || 200)}
          />
          <QueryBlock
            titleKey="artemQ2Title"
            descKey="artemQ2Desc"
            columns={[
              { key: 'id_product', labelKey: 'reportCategoryId' },
              { key: 'product_name', labelKey: 'name' },
            ]}
            onRun={() => getProductsSoldByAllCashiers()}
          />
        </TeamSection>
      </section>
    </Layout>
  );
}
