import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';

export default function Employees() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    cnic: '',
    branch_id: '',
    role_id: '',
    salary: '',
    password: '',
  });

  async function load() {
    setError('');
    try {
      const [e, r, b] = await Promise.all([
        api('/employees', { token }),
        api('/lookup/roles', { token }),
        api('/lookup/branches', { token }),
      ]);
      setRows(e);
      setRoles(r);
      setBranches(b);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  async function createEmp(ev) {
    ev.preventDefault();
    setError('');
    try {
      await api('/employees', {
        method: 'POST',
        token,
        body: {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          cnic: form.cnic.trim() || null,
          branch_id: Number(form.branch_id),
          role_id: Number(form.role_id),
          salary: Number(form.salary),
          password: form.password || undefined,
        },
      });
      showToast({ type: 'success', message: 'Employee account created.' });
      setForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        cnic: '',
        branch_id: '',
        role_id: '',
        salary: '',
        password: '',
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleActive(emp, active) {
    setError('');
    try {
      await api(`/employees/${emp.employee_id}`, {
        method: 'PATCH',
        token,
        body: { is_active: active },
      });
      showToast({
        type: 'success',
        message: active ? `${emp.first_name} reactivated.` : `${emp.first_name} deactivated.`,
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Staff</h1>
        <p className="muted">Managers can onboard employees and adjust active status.</p>
      </div>
      <ErrorBanner message={error} onDismiss={() => setError('')} />

      <div className="card">
        <h2>Add employee</h2>
        <form onSubmit={createEmp} className="stack two-col">
          <label>
            First name *
            <input
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              required
            />
          </label>
          <label>
            Last name *
            <input
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              required
            />
          </label>
          <label>
            Email *
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
          <label>
            Password (optional)
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Default password123"
            />
          </label>
          <label>
            Branch *
            <select
              value={form.branch_id}
              onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
              required
            >
              <option value="">Select…</option>
              {branches.map((b) => (
                <option key={b.branch_id} value={b.branch_id}>
                  {b.branch_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Role *
            <select
              value={form.role_id}
              onChange={(e) => setForm({ ...form, role_id: e.target.value })}
              required
            >
              <option value="">Select…</option>
              {roles.map((r) => (
                <option key={r.role_id} value={r.role_id}>
                  {r.role_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Salary (PKR) *
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
              required
            />
          </label>
          <label>
            Phone
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </label>
          <label>
            CNIC
            <input value={form.cnic} onChange={(e) => setForm({ ...form, cnic: e.target.value })} />
          </label>
          <div className="full">
            <button type="submit" className="btn primary">
              Create
            </button>
          </div>
        </form>
      </div>

      <div className="card pad-none table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Branch</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.employee_id}>
                <td>
                  {r.first_name} {r.last_name}
                </td>
                <td>{r.email}</td>
                <td>{r.role_name}</td>
                <td>{r.branch_name}</td>
                <td>
                  {r.is_active ? (
                    <button type="button" className="btn tiny ghost" onClick={() => toggleActive(r, false)}>
                      Deactivate
                    </button>
                  ) : (
                    <button type="button" className="btn tiny primary" onClick={() => toggleActive(r, true)}>
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
