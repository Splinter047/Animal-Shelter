import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { navItemsForRole } from '../auth/rbac.js';
import ApiHealthBadge from './ApiHealthBadge.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const items = user ? navItemsForRole(user.role) : [];

  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="top-bar">
        <div className="top-bar-row">
          <Link to="/" className="brand" onClick={() => setNavOpen(false)}>
            SAS Shelter
          </Link>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={navOpen}
            aria-controls="primary-navigation"
            onClick={() => setNavOpen((o) => !o)}
          >
            {navOpen ? 'Close' : 'Menu'}
          </button>
        </div>
        <nav
          id="primary-navigation"
          className={`main-nav ${navOpen ? 'is-open' : ''}`}
          aria-label="Primary"
        >
          {items.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setNavOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          <Link to="/report-stray" className="public-link" onClick={() => setNavOpen(false)}>
            Report a stray
          </Link>
        </nav>
        <div className="user-area">
          <ApiHealthBadge />
          {user && (
            <>
              <span className="user-meta">
                <span className="user-line">
                  {user.firstName} {user.lastName}
                  <span className="role-pill">{user.role}</span>
                </span>
                {user.branchName && (
                  <span className="user-branch muted small">{user.branchName}</span>
                )}
              </span>
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                Log out
              </button>
            </>
          )}
        </div>
      </header>
      <main id="main" className="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>Stray Animals Shelter — course project · PostgreSQL + Express + React</p>
      </footer>
    </div>
  );
}
