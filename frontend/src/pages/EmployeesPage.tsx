import { useEffect, useState } from 'react';
import CityInput from '../components/CityInput';
import Layout from '../components/Layout';
import { getEmployees, deleteEmployee, createEmployee, updateEmployee } from '../api/employees';

interface Employee {
  id_employee: string;
  empl_surname: string;
  empl_name: string;
  empl_patronymic: string | null;
  empl_role: string;
  salary: number;
  date_of_birth: string;
  date_of_start: string;
  phone_number: string;
  city: string;
  street: string;
  zip_code: string;
}

const emptyForm = {
  id_employee: '',
  empl_surname: '',
  empl_name: '',
  empl_patronymic: '',
  empl_role: 'Cashier',
  salary: '',
  date_of_birth: '',
  date_of_start: '',
  phone_number: '',
  city: '',
  street: '',
  zip_code: '',
  password: '',
};

const field = (label: string, children: React.ReactNode) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
    <label style={{ fontSize: '0.8rem', color: '#666' }}>{label}</label>
    {children}
  </div>
);

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const fetchEmployees = () => {
    getEmployees()
      .then((data) => {
        const mapped = data.map((row: any[]) => ({
          id_employee: row[0],
          empl_surname: row[1],
          empl_name: row[2],
          empl_patronymic: row[3],
          empl_role: row[4],
          salary: row[5],
          date_of_birth: row[6],
          date_of_start: row[7],
          phone_number: row[8],
          city: row[9],
          street: row[10],
          zip_code: row[11],
        }));
        setEmployees(mapped);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Видалити працівника?')) {
      deleteEmployee(id).then(fetchEmployees);
    }
  };

  const handleEdit = (e: Employee) => {
    setEditId(e.id_employee);
    setForm({
      id_employee: e.id_employee,
      empl_surname: e.empl_surname,
      empl_name: e.empl_name,
      empl_patronymic: e.empl_patronymic || '',
      empl_role: e.empl_role,
      salary: String(e.salary),
      date_of_birth: e.date_of_birth?.toString().split('T')[0] || '',
      date_of_start: e.date_of_start?.toString().split('T')[0] || '',
      phone_number: e.phone_number,
      city: e.city,
      street: e.street,
      zip_code: e.zip_code,
      password: '',
    });
    setShowForm(true);
    setError('');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    try {
      if (editId) {
        await updateEmployee(editId, {
          empl_surname: form.empl_surname,
          empl_name: form.empl_name,
          empl_patronymic: form.empl_patronymic || null,
          empl_role: form.empl_role,
          salary: parseFloat(form.salary),
          date_of_birth: form.date_of_birth,
          date_of_start: form.date_of_start,
          phone_number: form.phone_number,
          city: form.city,
          street: form.street,
          zip_code: form.zip_code,
        });
      } else {
        await createEmployee({
          ...form,
          salary: parseFloat(form.salary),
        });
      }
      handleCancel();
      fetchEmployees();
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map((e: any) => e.msg).join(', '));
      } else {
        setError(detail || 'Помилка');
      }
    }
  };

  const inputStyle = { padding: '0.5rem', width: '100%' };

  return (
    <Layout>
      <h1>Працівники</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          className="search-input"
          type="text"
          placeholder="Пошук за прізвищем..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => { setEditId(null); setForm(emptyForm); setShowForm(!showForm); setError(''); }}>
          {showForm && !editId ? 'Скасувати' : '+ Додати працівника'}
        </button>
      </div>

      {showForm && (
        <div style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <h3>{editId ? 'Редагувати працівника' : 'Новий працівник'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {!editId && field('ID працівника', <input style={inputStyle} value={form.id_employee} onChange={e => setForm({...form, id_employee: e.target.value})} />)}
            {field('Прізвище', <input style={inputStyle} value={form.empl_surname} onChange={e => setForm({...form, empl_surname: e.target.value})} />)}
            {field("Ім'я", <input style={inputStyle} value={form.empl_name} onChange={e => setForm({...form, empl_name: e.target.value})} />)}
            {field('По батькові', <input style={inputStyle} value={form.empl_patronymic} onChange={e => setForm({...form, empl_patronymic: e.target.value})} />)}
            {field('Роль', <select style={inputStyle} value={form.empl_role} onChange={e => setForm({...form, empl_role: e.target.value})}>
              <option value="Cashier">Касир</option>
              <option value="Manager">Менеджер</option>
            </select>)}
            {field('Зарплата', <input style={inputStyle} type="number" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} />)}
            {field('Дата народження', <input style={inputStyle} type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} />)}
            {field('Дата початку роботи', <input style={inputStyle} type="date" value={form.date_of_start} onChange={e => setForm({...form, date_of_start: e.target.value})} />)}
            {field('Телефон', <input style={inputStyle} value={form.phone_number} onChange={e => setForm({...form, phone_number: e.target.value})} />)}
            {field('Місто', <CityInput style={inputStyle} value={form.city} onChange={val => setForm({...form, city: val})} />)}
            {field('Вулиця', <input style={inputStyle} value={form.street} onChange={e => setForm({...form, street: e.target.value})} />)}
            {field('Індекс', <input style={inputStyle} value={form.zip_code} onChange={e => setForm({...form, zip_code: e.target.value})} />)}
            {!editId && field('Пароль', <input style={inputStyle} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />)}
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button onClick={handleSubmit}>Зберегти</button>
            <button onClick={handleCancel}>Скасувати</button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Завантаження...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Прізвище</th>
              <th>Ім'я</th>
              <th>По батькові</th>
              <th>Роль</th>
              <th>Зарплата</th>
              <th>Телефон</th>
              <th>Місто</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {employees.filter(e =>
              e.empl_surname.toLowerCase().includes(search.toLowerCase())
            ).map((e) => (
              <tr key={e.id_employee}>
                <td>{e.id_employee}</td>
                <td>{e.empl_surname}</td>
                <td>{e.empl_name}</td>
                <td>{e.empl_patronymic || '—'}</td>
                <td>{e.empl_role}</td>
                <td>{e.salary} грн</td>
                <td>{e.phone_number}</td>
                <td>{e.city}</td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(e)}>Редагувати</button>
                  <button onClick={() => handleDelete(e.id_employee)}>Видалити</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && employees.length === 0 && <p>Працівників не знайдено</p>}
    </Layout>
  );
}