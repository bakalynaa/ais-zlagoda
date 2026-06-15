import { useEffect, useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import {
  hasLoginAccess,
  registerLoginReloadReset,
} from '../utils/loginAccess';

export default function LoginGate() {
  const navigate = useNavigate();
  const [canShowLogin, setCanShowLogin] = useState(false);

  useLayoutEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role) {
      navigate(role === 'Manager' ? '/manager' : '/cashier', { replace: true });
      return;
    }

    if (!hasLoginAccess()) {
      navigate('/first-screen', { replace: true });
      return;
    }

    setCanShowLogin(true);
  }, [navigate]);

  useEffect(() => {
    if (!canShowLogin) return;
    return registerLoginReloadReset();
  }, [canShowLogin]);

  if (!canShowLogin) {
    return null;
  }

  return <LoginPage />;
}
