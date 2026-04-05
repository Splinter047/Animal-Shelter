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

const IMAGE_BASE = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
  : 'http://localhost:3000';

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
      let pendingAdoptionsData = [];
      if (canManageAdoptions(user.role)) {
        const adoptions = await api('/adoptions', { token });
        adoptionCount = adoptions.length;
        pendingAdoptionsData = adoptions.filter(a => a.status === 'Pending' || a.status === 'Approved').slice(0, 3);
      }
      let reportCount = null;
      let pendingReportsData = [];
      if (canViewRescueReports(user.role)) {
        const reports = await api('/rescues/reports', { token });
        const pending = reports.filter((r) => r.status === 'Pending');
        reportCount = pending.length;
        pendingReportsData = pending.slice(0, 3);
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

      // Identify animals needing care (In Shelter and last_care_date < today)
      const today = new Date().toISOString().split('T')[0];
      const pendingCareData = animals
        .filter(a => a.status === 'In Shelter' && (!a.last_care_date || a.last_care_date < today))
        .slice(0, 3);

      setStats({
        totalAnimals: animals.length,
        inShelter: byStatus['In Shelter'] || 0,
        adopted: byStatus.Adopted || 0,
        recentAnimals: animals.slice(0, 4),
        adoptionCount,
        pendingReports: reportCount,
        pendingReportsData,
        pendingAdoptionsData,
        pendingCareData,
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
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
  {((stats.pendingReportsData && stats.pendingReportsData.length > 0) || 
    (stats.pendingAdoptionsData && stats.pendingAdoptionsData.length > 0) ||
    (stats.pendingCareData && stats.pendingCareData.length > 0)) && (
    <section className="card">
      <h2>Pending Tasks</h2>
      <ul className="task-list">
        {stats.pendingCareData.map(a => (
          <li key={`care-${a.animal_id}`} className="task-item">
            <div className="task-info">
              <span className="task-title">Daily Care: {a.name || `#${a.animal_id}`}</span>
              <span className="task-meta">No logs recorded today</span>
            </div>
            <Link to={`/animals/${a.animal_id}`} className="btn tiny ghost">Log Care</Link>
          </li>
        ))}
        {stats.pendingReportsData.map(r => (
...

                    <li key={`rep-${r.report_id}`} className="task-item">
                      <div className="task-info">
                        <span className="task-title">Unassigned Report #{r.report_id}</span>
                        <span className="task-meta">{r.location_text}</span>
                      </div>
                      <Link to="/rescues" className="btn tiny ghost">View</Link>
                    </li>
                  ))}
                  {stats.pendingAdoptionsData.map(a => (
                    <li key={`ado-${a.adoption_id}`} className="task-item">
                      <div className="task-info">
                        <span className="task-title">Adoption for {a.animal_name}</span>
                        <span className="task-meta">Status: {a.status}</span>
                      </div>
                      <Link to="/adoptions" className="btn tiny ghost">Review</Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {stats.recentAnimals && stats.recentAnimals.length > 0 && (
              <section className="card">
                <h2>Recently Added</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                  {stats.recentAnimals.map(a => (
                    <Link key={a.animal_id} to={`/animals/${a.animal_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#eee', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                          {a.image_url ? (
                            <img src={`${IMAGE_BASE}${a.image_url}`} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '10px' }}>No Photo</div>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name || `#${a.animal_id}`}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
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
