import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';

const CHANNELS = ['Email', 'Phone', 'Walk-in', 'Other'];

export default function PublicReport() {
  const { showToast } = useToast();
  const [cities, setCities] = useState([]);
  const [form, setForm] = useState({
    channel: 'Walk-in',
    reporter_name: '',
    reporter_contact: '',
    description: '',
    location_text: '',
    city_id: '',
  });
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('/public/cities')
      .then(setCities)
      .catch(() => setCities([]));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api('/rescues/reports', {
        method: 'POST',
        body: {
          channel: form.channel,
          reporter_name: form.reporter_name.trim() || undefined,
          reporter_contact: form.reporter_contact.trim() || undefined,
          description: form.description.trim(),
          location_text: form.location_text.trim(),
          city_id: Number(form.city_id),
        },
      });
      setDone(true);
      showToast({ type: 'success', message: 'Report submitted. Thank you.' });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card wide">
        <h1>Report a stray animal</h1>
        <p className="muted">
          No login required. Your report is stored for shelter staff to review.{' '}
          <Link to="/login">Staff sign in</Link>
        </p>
        <ErrorBanner message={error} onDismiss={() => setError('')} />
        {done ? (
          <p className="ok-text">Thank you. Reference saved — staff will follow up.</p>
        ) : (
          <form onSubmit={submit} className="stack">
            <label>
              City *
              <select
                value={form.city_id}
                onChange={(e) => setForm({ ...form, city_id: e.target.value })}
                required
              >
                <option value="">Select…</option>
                {cities.map((c) => (
                  <option key={c.city_id} value={c.city_id}>
                    {c.city_name}, {c.province}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Where did you see the animal? *
              <input
                value={form.location_text}
                onChange={(e) => setForm({ ...form, location_text: e.target.value })}
                required
                placeholder="Street, area, landmark"
              />
            </label>
            <label>
              What happened? *
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                minLength={10}
              />
            </label>
            <label>
              Channel
              <select
                value={form.channel}
                onChange={(e) => setForm({ ...form, channel: e.target.value })}
              >
                {CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Your name (optional)
              <input
                value={form.reporter_name}
                onChange={(e) => setForm({ ...form, reporter_name: e.target.value })}
              />
            </label>
            <label>
              Contact (optional)
              <input
                value={form.reporter_contact}
                onChange={(e) => setForm({ ...form, reporter_contact: e.target.value })}
              />
            </label>
            <button type="submit" className="btn primary" disabled={busy}>
              {busy ? 'Sending…' : 'Submit report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
