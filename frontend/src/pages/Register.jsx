import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';

export default function Register() {
  const { register, token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    branch_id: '',
    phone: '',
    cnic: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await api('/public/branches');
        if (!cancelled) setBranches(list);
      } catch {
        if (!cancelled) setBranches([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!form.branch_id) {
      setError('Choose a branch.');
      return;
    }
    setBusy(true);
    try {
      await register({
        email: form.email.trim(),
        password: form.password,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        branch_id: Number(form.branch_id),
        phone: form.phone.trim() || undefined,
        cnic: form.cnic.trim() || undefined,
      });
      showToast({
        type: 'success',
        message: 'Account created. You are signed in as Caretaker.',
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card wide">
        <h1>Register</h1>
        <p className="muted">
          New accounts are created as <strong>Caretaker</strong> at the branch you select. A manager
          may change your role later.
        </p>
        <ErrorBanner message={error} onDismiss={() => setError('')} />
        <form onSubmit={handleSubmit} className="stack two-col">
          <label>
            First name
            <input
              value={form.first_name}
              onChange={(e) => update('first_name', e.target.value)}
              required
            />
          </label>
          <label>
            Last name
            <input
              value={form.last_name}
              onChange={(e) => update('last_name', e.target.value)}
              required
            />
          </label>
          <label className="full">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              required
            />
          </label>
          <label className="full">
            Password (min 8 characters)
            <input
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
              minLength={8}
            />
          </label>
          <label className="full">
            Branch
            <select
              value={form.branch_id}
              onChange={(e) => update('branch_id', e.target.value)}
              required
            >
              <option value="">Select branch…</option>
              {branches.map((b) => (
                <option key={b.branch_id} value={b.branch_id}>
                  {b.branch_name} — {b.city_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Phone (optional)
            <input value={form.phone} onChange={(e) => update('phone', e.target.value)} />
          </label>
          <label>
            CNIC (optional)
            <input value={form.cnic} onChange={(e) => update('cnic', e.target.value)} />
          </label>
          <div className="full">
            <button type="submit" className="btn primary" disabled={busy}>
              {busy ? 'Creating account…' : 'Create account'}
            </button>
          </div>
        </form>
        <p className="muted small">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
