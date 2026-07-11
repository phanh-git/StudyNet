import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedPage from './pages/FeedPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={user ? <Navigate to="/feed" replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/feed" replace /> : <RegisterPage />} />
        <Route
          path="/feed"
          element={
            <ProtectedRoute allowRoles={['USER', 'ADMIN']}>
              <FeedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <ProtectedRoute allowRoles={['USER', 'ADMIN']}>
              <GroupsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups/:groupId"
          element={
            <ProtectedRoute allowRoles={['USER', 'ADMIN']}>
              <GroupDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowRoles={['USER', 'ADMIN']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute allowRoles={['USER', 'ADMIN']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/settings" element={<Navigate to="/feed" replace />} />
        <Route path="/admin" element={<Navigate to="/feed" replace />} />
      </Routes>
    </div>
  );
}

export default App;
