import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';

const STATUSES = ['Pending', 'Approved', 'Rejected', 'Completed'];

export default function Adoptions() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [rows, setRows] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [form, setForm] = useState({
    animal_id: '',
    adopter_name: '',
    adopter_cnic: '',
    adopter_contact: '',
    adopter_address: '',
    adoption_fee: '0',
    status: 'Pending',
  });

  async function load() {
    setError('');
    try {
      const [a, an] = await Promise.all([
        api('/adoptions', { token }),
        api('/animals?status=In%20Shelter', { token }),
      ]);
      setRows(a);
      setAnimals(an);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    try {
      await api('/adoptions', {
        method: 'POST',
        token,
        body: {
          animal_id: Number(form.animal_id),
          adopter_name: form.adopter_name.trim(),
          adopter_cnic: form.adopter_cnic.trim() || null,
          adopter_contact: form.adopter_contact.trim(),
          adopter_address: form.adopter_address.trim() || null,
          adoption_fee: Number(form.adoption_fee),
          status: form.status,
        },
      });
      setInfo(
        form.status === 'Completed'
          ? 'Adoption recorded and animal marked adopted in one database transaction.'
          : 'Adoption created. Completing it later will still run in a transaction on the server.'
      );
      showToast({ type: 'success', message: 'Adoption saved.' });
      setForm({
        animal_id: '',
        adopter_name: '',
        adopter_cnic: '',
        adopter_contact: '',
        adopter_address: '',
        adoption_fee: '0',
        status: 'Pending',
      });
      load();
    } catch (err) {
      setError(
        err.message ||
          'Transaction rolled back — animal may already be adopted or unavailable.'
      );
    }
  }

  async function patchStatus(id, status) {
    setError('');
    setInfo('');
    try {
      await api(`/adoptions/${id}/status`, {
        method: 'PATCH',
        token,
        body: { status },
      });
      setInfo(
        status === 'Completed'
          ? 'Status updated; animal row locked and updated with the adoption in a single transaction.'
          : 'Status updated.'
      );
      showToast({ type: 'success', message: `Adoption marked ${status}.` });
      load();
    } catch (err) {
      setError(err.message || 'Update failed (server may have rolled back).');
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Adoptions</h1>
        <p className="muted">
          Creating or completing an adoption uses a PostgreSQL transaction: adoption insert/update and
          animal status change commit together or roll back together.
        </p>
      </div>
      <ErrorBanner message={error} onDismiss={() => setError('')} />
      {info && (
        <div className="banner ok" role="status">
          {info}
        </div>
      )}

      <div className="card">
        <h2>New adoption</h2>
        <form onSubmit={submit} className="stack two-col">
          <label>
            Animal *
            <select
              value={form.animal_id}
              onChange={(e) => setForm({ ...form, animal_id: e.target.value })}
              required
            >
              <option value="">In shelter…</option>
              {animals.map((a) => (
                <option key={a.animal_id} value={a.animal_id}>
                  #{a.animal_id} {a.name || 'Unnamed'} — {a.species_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Initial status
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            Adopter name *
            <input
              value={form.adopter_name}
              onChange={(e) => setForm({ ...form, adopter_name: e.target.value })}
              required
            />
          </label>
          <label>
            Contact *
            <input
              value={form.adopter_contact}
              onChange={(e) => setForm({ ...form, adopter_contact: e.target.value })}
              required
            />
          </label>
          <label>
            CNIC
            <input value={form.adopter_cnic} onChange={(e) => setForm({ ...form, adopter_cnic: e.target.value })} />
          </label>
          <label>
            Fee (PKR)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.adoption_fee}
              onChange={(e) => setForm({ ...form, adoption_fee: e.target.value })}
              required
            />
          </label>
          <label className="full">
            Address
            <textarea
              rows={2}
              value={form.adopter_address}
              onChange={(e) => setForm({ ...form, adopter_address: e.target.value })}
            />
          </label>
          <div className="full">
            <button type="submit" className="btn primary">
              Submit adoption
            </button>
          </div>
        </form>
      </div>

      <div className="card pad-none table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Animal</th>
              <th>Adopter</th>
              <th>Status</th>
              <th>Fee</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.adoption_id}>
                <td>{r.adoption_id}</td>
                <td>{r.animal_name}</td>
                <td>{r.adopter_name}</td>
                <td>{r.status}</td>
                <td>{r.adoption_fee}</td>
                <td className="actions">
                  {STATUSES.filter((s) => s !== r.status).map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="btn tiny ghost"
                      onClick={() => patchStatus(r.adoption_id, s)}
                    >
                      Set {s}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
