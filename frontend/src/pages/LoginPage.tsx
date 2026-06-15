import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { devLogin } from '../utils/devLogin';
import type { UserRole } from '../types';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [idEmployee, setIdEmployee] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleDevLogin(role: UserRole) {
    devLogin(role);
    navigate(role === 'Manager' ? '/manager' : '/cashier');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(idEmployee, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);

      if (data.role === 'Manager') {
        navigate('/manager');
      } else {
        navigate('/cashier');
      }
    } catch {
      setError('Невірний логін або пароль');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>ВХІД</h2>

        <form id="loginForm" onSubmit={handleSubmit}>
          <div className="input-group">
            <i className="fas fa-user" aria-hidden="true" />
            <input
              type="text"
              id="username"
              value={idEmployee}
              onChange={(e) => setIdEmployee(e.target.value)}
              placeholder=" "
              required
              autoComplete="username"
            />
            <label htmlFor="username">ID працівника</label>
          </div>

          <div className="input-group">
            <i className="fas fa-lock" aria-hidden="true" />
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              required
              autoComplete="current-password"
            />
            <label htmlFor="password">Пароль</label>
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="login-btn" id="submitBtn" disabled={loading}>
            {loading ? 'Перевірка...' : 'Увійти'}
          </button>
        </form>

        {import.meta.env.DEV && (
          <div className="login-test">
            <p>тест</p>
            <button
              type="button"
              className="login-btn login-test-btn"
              onClick={() => handleDevLogin('Manager')}
            >
              Увійти без кредів
            </button>
            <button
              type="button"
              className="login-btn login-test-btn-secondary"
              onClick={() => handleDevLogin('Cashier')}
            >
              Увійти як касир
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
