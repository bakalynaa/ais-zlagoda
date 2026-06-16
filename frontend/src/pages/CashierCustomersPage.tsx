import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getCustomers, createCustomer, updateCustomer } from '../api/customers';
import CityInput from '../components/CityInput';
import { useLanguage } from '../i18n/LanguageContext';

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

const field = (label: string, children: React.ReactNode, required = false) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
    <label style={{ fontSize: '0.8rem', color: '#666' }}>
      {label}{required && <span style={{ color: 'red' }}> *</span>}
    </label>
    {children}
  </div>
);

export default function CashierCustomersPage() {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const fetchCustomers = (surname?: string) => {
    setLoading(true);
    getCustomers(surname)
      .then((data) => {
        const mapped = data.map((row: unknown[]) => ({
          card_number: row[0] as string,
          cust_surname: row[1] as string,
          cust_name: row[2] as string,
          cust_patronymic: row[3] as string | null,
          phone_number: row[4] as string,
          city: row[5] as string | null,
          street: row[6] as string | null,
          zip_code: row[7] as string | null,
          percent: row[8] as number,
        }));
        setCustomers(mapped);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleEdit = (c: Customer) => {
    setEditId(c.card_number);
    setForm({
      card_number: c.card_number,
      cust_surname: c.cust_surname,
      cust_name: c.cust_name,
      cust_patronymic: c.cust_patronymic || '',
      phone_number: c.phone_number,
      city: c.city || '',
      street: c.street || '',
      zip_code: c.zip_code || '',
      percent: String(c.percent),
    });
    setShowForm(true);
    setError('');
    setTouched({});
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
    setError('');
    setTouched({});
  };

  const requiredFields = editId
    ? ['cust_surname', 'cust_name', 'phone_number', 'percent']
    : ['card_number', 'cust_surname', 'cust_name', 'phone_number', 'percent'];

  const isInvalid = (f: string) => touched[f] && requiredFields.includes(f) && !form[f as keyof typeof form];

  const inputStyle = (f: string) => ({
    padding: '0.5rem',
    width: '100%',
    border: isInvalid(f) ? '1px solid red' : '1px solid #ccc',
    borderRadius: '4px',
  });

  const handleSubmit = async () => {
    const allTouched = Object.fromEntries(requiredFields.map((f) => [f, true]));
    setTouched(allTouched);
    const hasEmpty = requiredFields.some((f) => !form[f as keyof typeof form]);
    if (hasEmpty) {
      setError(t('fillRequired'));
      return;
    }
    setError('');
    try {
      if (editId) {
        await updateCustomer(editId, {
          cust_surname: form.cust_surname,
          cust_name: form.cust_name,
          cust_patronymic: form.cust_patronymic || null,
          phone_number: form.phone_number,
          city: form.city || null,
          street: form.street || null,
          zip_code: form.zip_code || null,
          percent: parseInt(form.percent, 10),
        });
      } else {
        await createCustomer({
          ...form,
          percent: parseInt(form.percent, 10),
        });
      }
      handleCancel();
      fetchCustomers();
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } }).response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((e: { msg: string }) => e.msg).join(', '));
      } else {
        setError(typeof detail === 'string' ? detail : t('errorGeneric'));
      }
    }
  };

  return (
    <Layout>
      <section className="manager-page">
        <div className="manager-page-header">
          <h1>{t('customersTitle')}</h1>
          <button
            type="button"
            className={`manager-action-btn ${showForm ? 'manager-action-btn--ghost' : 'manager-action-btn--primary'}`}
            onClick={() => { setEditId(null); setForm(emptyForm); setShowForm(!showForm); setError(''); setTouched({}); }}
          >
            {showForm && !editId ? t('cancel') : t('addCustomer')}
          </button>
        </div>

        <div className="manager-inline-form">
          <input
            className="search-input manager-field-input"
            type="text"
            placeholder={t('searchBySurname')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" onClick={() => fetchCustomers(search || undefined)}>{t('search')}</button>
          <button type="button" onClick={() => { setSearch(''); fetchCustomers(); }}>{t('reset')}</button>
        </div>

        {showForm && (
          <div style={{ border: '1px solid var(--border-soft)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <h3>{editId ? t('editCustomer') : t('newCustomer')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {!editId && field(t('cardNumber'), <input style={inputStyle('card_number')} value={form.card_number} onChange={(e) => setForm({ ...form, card_number: e.target.value })} />, true)}
              {field(t('surname'), <input style={inputStyle('cust_surname')} value={form.cust_surname} onChange={(e) => setForm({ ...form, cust_surname: e.target.value })} />, true)}
              {field(t('firstName'), <input style={inputStyle('cust_name')} value={form.cust_name} onChange={(e) => setForm({ ...form, cust_name: e.target.value })} />, true)}
              {field(t('patronymic'), <input style={inputStyle('cust_patronymic')} value={form.cust_patronymic} onChange={(e) => setForm({ ...form, cust_patronymic: e.target.value })} />)}
              {field(t('phone'), <input style={inputStyle('phone_number')} value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />, true)}
              {field(t('discountPercent'), <input style={inputStyle('percent')} type="number" value={form.percent} onChange={(e) => setForm({ ...form, percent: e.target.value })} />, true)}
              {field(t('city'), <CityInput style={inputStyle('city')} value={form.city} onChange={(val) => setForm({ ...form, city: val })} />)}
              {field(t('street'), <input style={inputStyle('street')} value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />)}
              {field(t('zipCode'), <input style={inputStyle('zip_code')} value={form.zip_code} onChange={(e) => setForm({ ...form, zip_code: e.target.value })} />)}
            </div>
            {error && <p className="manager-field-error">{error}</p>}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button type="button" className="manager-action-btn manager-action-btn--primary" onClick={handleSubmit}>{t('save')}</button>
              <button type="button" className="manager-action-btn manager-action-btn--ghost" onClick={handleCancel}>{t('cancel')}</button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="manager-status">{t('loading')}</p>
        ) : (
          <div className="manager-table-wrap">
            <table className="manager-table data-table">
              <thead>
                <tr>
                  <th>{t('cardNumber')}</th>
                  <th>{t('surname')}</th>
                  <th>{t('firstName')}</th>
                  <th>{t('phone')}</th>
                  <th>{t('city')}</th>
                  <th>{t('discount')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.card_number}>
                    <td>{c.card_number}</td>
                    <td>{c.cust_surname}</td>
                    <td>{c.cust_name}</td>
                    <td>{c.phone_number}</td>
                    <td>{c.city || t('dash')}</td>
                    <td>{c.percent}%</td>
                    <td>
                      <button type="button" className="manager-action-btn manager-action-btn--ghost" onClick={() => handleEdit(c)}>
                        {t('edit')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && customers.length === 0 && <p className="manager-empty">{t('customersEmpty')}</p>}
      </section>
    </Layout>
  );
}
