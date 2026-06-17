import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowRole, children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowRole && user.role !== allowRole) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/feed'} replace />;
  }

  return children;
}
