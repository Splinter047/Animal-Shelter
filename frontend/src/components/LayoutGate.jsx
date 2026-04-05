import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Layout from './Layout.jsx';

export default function LayoutGate() {
  const { user, loading, token } = useAuth();
  const location = useLocation();

  if (loading && token) {
    return (
      <div className="auth-page">
        <p className="muted">Checking session…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Layout />;
}
