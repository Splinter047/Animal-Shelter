import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';

const GENDERS = [
  { v: 'M', l: 'Male' },
  { v: 'F', l: 'Female' },
  { v: 'U', l: 'Unknown' },
];
const HEALTH = ['Healthy', 'Injured', 'Sick', 'Recovering', 'Unknown'];

export default function Surrender() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [species, setSpecies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '',
    species_id: '',
    branch_id: '',
    breed: '',
    gender: 'U',
    colour: '',
    weight_kg: '',
    health_status: 'Unknown',
    date_of_birth: '',
    counterparty_name: '',
    counterparty_contact: '',
    notes: '',
  });

  useEffect(() => {
    Promise.all([api('/lookup/species', { token }), api('/lookup/branches', { token })]).then(
      ([sp, br]) => {
        setSpecies(sp);
        setBranches(br);
      }
    );
  }, [token]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    setBusy(true);
    try {
      await api('/animals/surrender', {
        method: 'POST',
        token,
        body: {
          name: form.name.trim(),
          species_id: Number(form.species_id),
          branch_id: Number(form.branch_id),
          breed: form.breed.trim() || null,
          gender: form.gender,
          colour: form.colour.trim() || null,
          weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
          health_status: form.health_status,
          date_of_birth: form.date_of_birth || null,
          counterparty_name: form.counterparty_name.trim() || null,
          counterparty_contact: form.counterparty_contact.trim() || null,
          notes: form.notes.trim() || null,
        },
      });
      setInfo(
        'Surrender completed: animal, donation/sale record, and initial care log were inserted in one transaction.'
      );
      showToast({ type: 'success', message: 'Surrender intake saved (single DB transaction).' });
    } catch (err) {
      setError(err.message || 'Transaction failed — no partial records should remain.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Owner surrender intake</h1>
        <p className="muted">
          Atomic workflow: new animal row, animal_sale (donation received), and care log commit together or
          roll back together.
        </p>
      </div>
      <ErrorBanner message={error} onDismiss={() => setError('')} />
      {info && (
        <div className="banner ok" role="status">
          {info}
        </div>
      )}
      <form className="card stack two-col" onSubmit={submit}>
        <label>
          Animal name *
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>
          Species *
          <select
            value={form.species_id}
            onChange={(e) => setForm({ ...form, species_id: e.target.value })}
            required
          >
            <option value="">Select…</option>
            {species.map((s) => (
              <option key={s.species_id} value={s.species_id}>
                {s.species_name}
              </option>
            ))}
          </select>
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
          Former owner name
          <input
            value={form.counterparty_name}
            onChange={(e) => setForm({ ...form, counterparty_name: e.target.value })}
          />
        </label>
        <label>
          Former owner contact
          <input
            value={form.counterparty_contact}
            onChange={(e) => setForm({ ...form, counterparty_contact: e.target.value })}
          />
        </label>
        <label>
          Breed
          <input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} />
        </label>
        <label>
          Gender
          <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            {GENDERS.map((g) => (
              <option key={g.v} value={g.v}>
                {g.l}
              </option>
            ))}
          </select>
        </label>
        <label>
          Health
          <select
            value={form.health_status}
            onChange={(e) => setForm({ ...form, health_status: e.target.value })}
          >
            {HEALTH.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </label>
        <label>
          Weight kg
          <input
            type="number"
            step="0.01"
            value={form.weight_kg}
            onChange={(e) => setForm({ ...form, weight_kg: e.target.value })}
          />
        </label>
        <label>
          Colour
          <input value={form.colour} onChange={(e) => setForm({ ...form, colour: e.target.value })} />
        </label>
        <label>
          Date of birth
          <input
            type="date"
            value={form.date_of_birth}
            onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
          />
        </label>
        <label className="full">
          Notes
          <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </label>
        <div className="full">
          <button type="submit" className="btn primary" disabled={busy}>
            {busy ? 'Saving…' : 'Record surrender'}
          </button>
        </div>
      </form>
    </div>
  );
}
