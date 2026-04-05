import { useAuth } from '../context/AuthContext.jsx';

export default function RoleRoute({ roles, children }) {
  const { user } = useAuth();

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="card error-card">
        <h2>Access denied</h2>
        <p>
          Your role (<strong>{user.role}</strong>) cannot use this page.
        </p>
      </div>
    );
  }

  return children;
}
