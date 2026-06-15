import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IntroScreen from '../components/IntroScreen/IntroScreen';
import { allowLoginAccess } from '../utils/loginAccess';

export default function FirstScreenPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (token && role) {
      navigate(role === 'Manager' ? '/manager' : '/cashier', { replace: true });
    }
  }, [navigate, role, token]);

  function handleComplete() {
    allowLoginAccess();
    navigate('/login', { replace: true });
  }

  if (token && role) {
    return null;
  }

  return <IntroScreen onComplete={handleComplete} />;
}
