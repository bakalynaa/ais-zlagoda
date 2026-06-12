import { Navigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
  role?: 'Manager' | 'Cashier';
}

export default function PrivateRoute({ children, role }: Props) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to="/login" replace />;

  return children;
}