import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import {
  canManageAdoptions,
  canManageMissions,
  canViewRescueReports,
} from '../auth/rbac.js';

export default function Dashboard() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  async function load(opts = {}) {
    const silent = opts.silent === true;
    setError('');
    setRefreshing(true);
    try {
      const animals = await api('/animals', { token });
      let adoptionCount = null;
      if (canManageAdoptions(user.role)) {
        const adoptions = await api('/adoptions', { token });
        adoptionCount = adoptions.length;
      }
      let reportCount = null;
      if (canViewRescueReports(user.role)) {
        const reports = await api('/rescues/reports', { token });
        reportCount = reports.filter((r) => r.status === 'Pending').length;
      }
      let missionCount = null;
      if (canManageMissions(user.role)) {
        const missions = await api('/rescues/missions', { token });
        missionCount = missions.filter((m) => m.outcome === 'Ongoing').length;
      }

      const byStatus = animals.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalAnimals: animals.length,
        inShelter: byStatus['In Shelter'] || 0,
        adopted: byStatus.Adopted || 0,
        adoptionCount,
        pendingReports: reportCount,
        ongoingMissions: missionCount,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      setError(e.message);
      if (!silent) {
        showToast({ type: 'warning', message: e.message || 'Could not refresh dashboard.' });
      }
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, [token, user.role]);

  useEffect(() => {
    const id = setInterval(() => load({ silent: true }), 25000);
    return () => clearInterval(id);
  }, [token, user.role]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome, {user.firstName}</h1>
        {user.branchName && (
          <p className="dashboard-branch">
            <span className="muted">Your branch:</span> {user.branchName}
          </p>
        )}
        <p className="muted">
          Branch activity overview. Data refreshes automatically every 25 seconds (polling).
        </p>
        <button type="button" className="btn ghost small" onClick={load} disabled={refreshing}>
          {refreshing ? 'Refreshing…' : 'Refresh now'}
        </button>
      </div>
      <ErrorBanner message={error} onDismiss={() => setError('')} />
      {stats && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <span className="stat-value">{stats.totalAnimals}</span>
              <span className="stat-label">Animals on record</span>
            </div>
            <div className="stat-card highlight">
              <span className="stat-value">{stats.inShelter}</span>
              <span className="stat-label">In shelter now</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.adopted}</span>
              <span className="stat-label">Adopted (total)</span>
            </div>
            {stats.adoptionCount != null && (
              <div className="stat-card">
                <span className="stat-value">{stats.adoptionCount}</span>
                <span className="stat-label">Adoption records</span>
              </div>
            )}
            {stats.pendingReports != null && (
              <div className="stat-card warn">
                <span className="stat-value">{stats.pendingReports}</span>
                <span className="stat-label">Pending reports</span>
              </div>
            )}
            {stats.ongoingMissions != null && (
              <div className="stat-card">
                <span className="stat-value">{stats.ongoingMissions}</span>
                <span className="stat-label">Ongoing missions</span>
              </div>
            )}
          </div>
          <p className="muted small">Last updated: {new Date(stats.updatedAt).toLocaleString()}</p>
        </>
      )}

      <section className="card quick-links">
        <h2>Quick links</h2>
        <ul>
          <li>
            <Link to="/animals">Browse animals</Link> — intake, health, and care logs
          </li>
          {canManageAdoptions(user.role) && (
            <li>
              <Link to="/adoptions">Adoptions</Link> — atomic adoption workflow (DB transaction)
            </li>
          )}
          {canViewRescueReports(user.role) && (
            <li>
              <Link to="/rescues">Rescues</Link> — reports and missions
            </li>
          )}
          <li>
            <Link to="/analytics">Analytics</Link> — charts and CSV export
          </li>
        </ul>
      </section>
    </div>
  );
}
