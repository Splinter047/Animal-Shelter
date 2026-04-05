import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { canManageAdoptions } from '../auth/rbac.js';

const COLORS = ['#3d7a6b', '#c4a35a', '#6b8cae', '#a86b7c', '#7a6b9e', '#8f8f8f'];

export default function Analytics() {
  const { token, user } = useAuth();
  const [animals, setAnimals] = useState([]);
  const [adoptions, setAdoptions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const a = await api('/animals', { token });
        if (cancelled) return;
        setAnimals(a);
        if (canManageAdoptions(user.role)) {
          const ad = await api('/adoptions', { token });
          if (!cancelled) setAdoptions(ad);
        } else {
          setAdoptions([]);
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, user.role]);

  const byStatus = useMemo(() => {
    const m = {};
    animals.forEach((a) => {
      m[a.status] = (m[a.status] || 0) + 1;
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [animals]);

  const bySpecies = useMemo(() => {
    const m = {};
    animals.forEach((a) => {
      const k = a.species_name || 'Unknown';
      m[k] = (m[k] || 0) + 1;
    });
    return Object.entries(m).map(([name, count]) => ({ name, count }));
  }, [animals]);

  const adoptionByStatus = useMemo(() => {
    const m = {};
    adoptions.forEach((a) => {
      m[a.status] = (m[a.status] || 0) + 1;
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [adoptions]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Analytics</h1>
        <p className="muted">Charts built from live API data. Export filtered animals from the Animals page (CSV).</p>
      </div>
      <ErrorBanner message={error} onDismiss={() => setError('')} />
      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="chart-grid">
          <div className="card chart-card">
            <h2>Animals by status</h2>
            <div className="chart-area">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={byStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {byStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card chart-card">
            <h2>Inventory by species</h2>
            <div className="chart-area">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={bySpecies} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3530" />
                  <XAxis dataKey="name" tick={{ fill: '#b8c4be' }} />
                  <YAxis allowDecimals={false} tick={{ fill: '#b8c4be' }} />
                  <Tooltip contentStyle={{ background: '#1a2220', border: '1px solid #2f3d36' }} />
                  <Legend />
                  <Bar dataKey="count" name="Animals" fill="#3d7a6b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {adoptions.length > 0 && (
            <div className="card chart-card full-width">
              <h2>Adoption pipeline</h2>
              <div className="chart-area">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={adoptionByStatus} layout="vertical" margin={{ left: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3530" />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: '#b8c4be' }} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fill: '#b8c4be' }} />
                    <Tooltip contentStyle={{ background: '#1a2220', border: '1px solid #2f3d36' }} />
                    <Bar dataKey="value" name="Records" fill="#c4a35a" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
