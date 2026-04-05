import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';

export default function AuditLogs() {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await api('/lookup/audit-logs', { token });
      setLogs(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  return (
    <div className="page">
      <div className="page-header row">
        <div>
          <h1>Audit Logs</h1>
          <p className="muted">Track system changes and data modifications (Managers only).</p>
        </div>
        <button type="button" className="btn ghost" onClick={load} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      {loading ? (
        <p>Loading audit trail...</p>
      ) : (
        <div className="card pad-none table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Table</th>
                <th>Record ID</th>
                <th>Changes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.audit_id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {new Date(log.changed_at).toLocaleString()}
                  </td>
                  <td>{log.changed_by}</td>
                  <td>
                    <span className={`role-pill`} style={{ 
                      backgroundColor: log.action === 'INSERT' ? '#152a22' : log.action === 'DELETE' ? '#2a1818' : '#151c19'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.table_name}</td>
                  <td>{log.record_id}</td>
                  <td style={{ maxWidth: '300px', fontSize: '0.8rem' }}>
                    {log.old_value && <div><span className="muted">From:</span> {log.old_value}</div>}
                    {log.new_value && <div><span className="muted">To:</span> {log.new_value}</div>}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="6" className="centered muted">No audit logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
