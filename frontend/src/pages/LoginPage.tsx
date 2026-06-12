import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { devLogin } from '../utils/devLogin';
import type { UserRole } from '../types';

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
    <main className="login-page">
      <h1>SVAGoda</h1>
      <p>Вхід у систему</p>

      <form onSubmit={handleSubmit}>
        <label>
          ID працівника
          <input
            type="text"
            value={idEmployee}
            onChange={(e) => setIdEmployee(e.target.value)}
            required
          />
        </label>

        <label>
          Пароль
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Вхід...' : 'Увійти'}
        </button>
      </form>

      {import.meta.env.DEV && (
        <div className="login-test">
          <p>Режим розробки — backend не потрібен</p>
          <button
            type="button"
            className="login-test-btn"
            onClick={() => handleDevLogin('Manager')}
          >
            Увійти без кредів (тест)
          </button>
          <button
            type="button"
            className="login-test-btn-secondary"
            onClick={() => handleDevLogin('Cashier')}
          >
            Увійти як касир
          </button>
        </div>
      )}
    </main>
  );
}