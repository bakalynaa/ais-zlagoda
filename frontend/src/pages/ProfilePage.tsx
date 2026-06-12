import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getMe } from '../api/employees';
import type { EmployeeRow } from '../types';

const DEV_MOCK: EmployeeRow = [
  'DEV001', 'Тестовий', 'Користувач', null,
  'Manager', 15000, '1990-01-01', '2024-01-01',
  '+380679116767', 'Київ', 'Свага', '07007',
];

export default function ProfilePage() {
  const [employee, setEmployee] = useState<EmployeeRow | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token === 'dev-test-token') {
      const role = localStorage.getItem('role');
      setEmployee([
        ...DEV_MOCK.slice(0, 4),
        role === 'Cashier' ? 'Cashier' : 'Manager',
        ...DEV_MOCK.slice(5),
      ] as EmployeeRow);
      return;
    }

    getMe()
      .then(setEmployee)
      .catch(() => setError('Не вдалося завантажити профіль'));
  }, []);

  if (error) return <Layout><p className="error">{error}</p></Layout>;
  if (!employee) return <Layout><p>Завантаження...</p></Layout>;

  const [id, surname, name, patronymic, role, salary, dob, start, phone, city, street, zip] = employee;

  return (
    <Layout>
      <h1>Профіль</h1>
      <dl className="profile-list">
        <dt>ID</dt><dd>{id}</dd>
        <dt>ПІБ</dt><dd>{surname} {name} {patronymic ?? ''}</dd>
        <dt>Посада</dt><dd>{role === 'Manager' ? 'Менеджер' : 'Касир'}</dd>
        <dt>Зарплата</dt><dd>{salary} грн</dd>
        <dt>Дата народження</dt><dd>{dob}</dd>
        <dt>Дата початку роботи</dt><dd>{start}</dd>
        <dt>Телефон</dt><dd>{phone}</dd>
        <dt>Адреса</dt><dd>{city}, {street}, {zip}</dd>
      </dl>
    </Layout>
  );
}