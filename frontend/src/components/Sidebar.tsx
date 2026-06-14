import { NavLink } from 'react-router-dom';

const managerLinks = [
  { to: '/manager', label: 'Головна', end: true },
  { to: '/manager/employees', label: 'Працівники' },
  { to: '/manager/categories', label: 'Категорії' },
  { to: '/manager/products', label: 'Товари' },
  { to: '/manager/store-products', label: 'Товари в магазині' },
  { to: '/manager/customers', label: 'Клієнти' },
  { to: '/manager/checks', label: 'Чеки' },
  { to: '/manager/reports', label: 'Звіти' },
  { to: '/manager/statistics', label: 'Статистика' },
];

const cashierLinks = [
  { to: '/cashier', label: 'Каса', end: true },
  { to: '/cashier/products', label: 'Товари' },
  { to: '/cashier/customers', label: 'Клієнти' },
  { to: '/cashier/checks', label: 'Мої чеки' },
];

export default function Sidebar() {
  const role = localStorage.getItem('role');
  const links = role === 'Manager' ? managerLinks : cashierLinks;

  return (
    <nav className="sidebar">
      <ul>
        {links.map(({ to, label, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={({ isActive }) => isActive ? 'active' : ''}>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}