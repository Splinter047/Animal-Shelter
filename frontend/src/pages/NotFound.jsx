import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="card not-found-card">
        <p className="not-found-code">404</p>
        <h1>Page not found</h1>
        <p className="muted">
          That URL does not match any screen in the shelter app. Check the address or use the links below.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn primary">
            Dashboard
          </Link>
          <Link to="/login" className="btn ghost">
            Sign in
          </Link>
          <Link to="/report-stray" className="btn ghost">
            Report a stray
          </Link>
        </div>
      </div>
    </div>
  );
}
