import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowRole, allowRoles, children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const permittedRoles = allowRoles ?? (allowRole ? [allowRole] : null);

  if (permittedRoles && !permittedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/feed'} replace />;
  }

  return children;
}
