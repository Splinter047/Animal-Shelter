import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import ErrorBanner from '../components/ErrorBanner.jsx';
import {
  canCreateAnimal,
  canDeleteAnimal,
  canEditAnimal,
} from '../auth/rbac.js';

const STATUSES = [
  'In Shelter',
  'Adopted',
  'Sold',
  'Deceased',
  'Released',
];
const HEALTH = ['Healthy', 'Injured', 'Sick', 'Recovering', 'Unknown'];
const GENDERS = [
  { v: 'M', l: 'Male' },
  { v: 'F', l: 'Female' },
  { v: 'U', l: 'Unknown' },
];
const INTAKE = ['Rescue', 'Donation', 'Owner Surrender', 'Other'];

function buildQuery(filters) {
  const q = new URLSearchParams();
  if (filters.status) q.set('status', filters.status);
  if (filters.species_id) q.set('species_id', filters.species_id);
  if (filters.branch_id) q.set('branch_id', filters.branch_id);
  if (filters.health_status) q.set('health_status', filters.health_status);
  const s = q.toString();
  return s ? `?${s}` : '';
}

export default function Animals() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [rawList, setRawList] = useState([]);
  const [species, setSpecies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    species_id: '',
    branch_id: '',
    health_status: '',
    q: '',
  });
  const debouncedQ = useDebouncedValue(filters.q, 280);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    species_id: '',
    breed: '',
    gender: 'U',
    branch_id: '',
    health_status: 'Unknown',
    status: 'In Shelter',
    intake_method: 'Rescue',
    weight_kg: '',
    colour: '',
    date_of_birth: '',
  });
  const [selected, setSelected] = useState(new Set());
  const [batchStatus, setBatchStatus] = useState('Released');
  const [batchBusy, setBatchBusy] = useState(false);
  const [batchResult, setBatchResult] = useState(null);

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const [raw, sp, br] = await Promise.all([
        api(`/animals${buildQuery(filters)}`, { token }),
        api('/lookup/species', { token }),
        api('/lookup/branches', { token }),
      ]);
      setSpecies(sp);
      setBranches(br);
      setRawList(raw);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [
    token,
    filters.status,
    filters.species_id,
    filters.branch_id,
    filters.health_status,
  ]);

  const filteredForDisplay = useMemo(() => {
    const qlow = debouncedQ.trim().toLowerCase();
    if (!qlow) return rawList;
    return rawList.filter(
      (a) =>
        (a.name && a.name.toLowerCase().includes(qlow)) ||
        (a.breed && a.breed.toLowerCase().includes(qlow)) ||
        String(a.animal_id).includes(qlow)
    );
  }, [rawList, debouncedQ]);

  function toggleSel(id) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  async function runBatchStatus() {
    if (selected.size === 0 || !canEditAnimal(user.role)) return;
    setBatchBusy(true);
    setBatchResult(null);
    const ids = [...selected];
    const results = await Promise.allSettled(
      ids.map((id) =>
        api(`/animals/${id}`, {
          method: 'PATCH',
          token,
          body: { status: batchStatus },
        })
      )
    );
    const ok = results.filter((r) => r.status === 'fulfilled').length;
    const fail = results.length - ok;
    setBatchResult({
      ok,
      fail,
      detail: fail
        ? 'Some updates failed (e.g. validation or permissions). Successful rows were still saved.'
        : 'All selected animals updated.',
    });
    showToast({
      type: fail ? 'warning' : 'success',
      message: `Batch update: ${ok} succeeded${fail ? `, ${fail} failed` : ''}.`,
    });
    setBatchBusy(false);
    setSelected(new Set());
    refresh();
  }

  async function createAnimal(e) {
    e.preventDefault();
    setError('');
    try {
      await api('/animals', {
        method: 'POST',
        token,
        body: {
          name: createForm.name || null,
          species_id: Number(createForm.species_id),
          branch_id: Number(createForm.branch_id),
          breed: createForm.breed || null,
          gender: createForm.gender,
          health_status: createForm.health_status,
          status: createForm.status,
          intake_method: createForm.intake_method,
          weight_kg: createForm.weight_kg ? Number(createForm.weight_kg) : null,
          colour: createForm.colour || null,
          date_of_birth: createForm.date_of_birth || null,
        },
      });
      showToast({ type: 'success', message: 'Animal record created.' });
      setShowCreate(false);
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeAnimal(id) {
    if (!window.confirm('Delete this animal record?')) return;
    try {
      await api(`/animals/${id}`, { method: 'DELETE', token });
      showToast({ type: 'success', message: 'Animal deleted.' });
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  function exportCsv() {
    const headers = [
      'animal_id',
      'name',
      'species',
      'breed',
      'status',
      'health_status',
      'branch',
      'city',
    ];
    const rows = filteredForDisplay.map((a) =>
      [
        a.animal_id,
        a.name,
        a.species_name,
        a.breed,
        a.status,
        a.health_status,
        a.branch_name,
        a.city_name,
      ]
        .map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`)
        .join(',')
    );
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `animals-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({ type: 'success', message: `Exported ${filteredForDisplay.length} rows to CSV.` });
  }

  return (
    <div className="page">
      <div className="page-header row">
        <div>
          <h1>Animals</h1>
          <p className="muted">Search, filter, CRUD, batch status updates, and CSV export.</p>
        </div>
        <div className="btn-row">
          <button type="button" className="btn ghost" onClick={exportCsv}>
            Export CSV
          </button>
          {canCreateAnimal(user.role) && (
            <button type="button" className="btn primary" onClick={() => setShowCreate(true)}>
              Add animal
            </button>
          )}
        </div>
      </div>
      <ErrorBanner message={error} onDismiss={() => setError('')} />

      <div className="card filters">
        <h2>Filters</h2>
        <div className="filter-grid">
          <label>
            Status
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="">Any</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            Species
            <select
              value={filters.species_id}
              onChange={(e) => setFilters((f) => ({ ...f, species_id: e.target.value }))}
            >
              <option value="">Any</option>
              {species.map((s) => (
                <option key={s.species_id} value={s.species_id}>
                  {s.species_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Branch
            <select
              value={filters.branch_id}
              onChange={(e) => setFilters((f) => ({ ...f, branch_id: e.target.value }))}
            >
              <option value="">Any</option>
              {branches.map((b) => (
                <option key={b.branch_id} value={b.branch_id}>
                  {b.branch_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Health
            <select
              value={filters.health_status}
              onChange={(e) => setFilters((f) => ({ ...f, health_status: e.target.value }))}
            >
              <option value="">Any</option>
              {HEALTH.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </label>
          <label className="wide">
            Search (name, breed, id)
            <div className="inline">
              <input
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                placeholder="Type to filter client-side…"
                aria-busy={filters.q !== debouncedQ}
              />
              {filters.q !== debouncedQ && (
                <span className="search-hint muted small">Filtering…</span>
              )}
              <button type="button" className="btn ghost" onClick={refresh}>
                Apply server filters
              </button>
            </div>
          </label>
        </div>
      </div>

      {canEditAnimal(user.role) && (
        <div className="card batch-bar">
          <h2>Batch operations</h2>
          <p className="muted small">
            Select rows, choose a new status, then update. Each row is a separate API call; the server
            validates every animal independently.
          </p>
          <div className="inline wrap">
            <span className="muted">{selected.size} selected</span>
            <select value={batchStatus} onChange={(e) => setBatchStatus(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn primary"
              disabled={selected.size === 0 || batchBusy}
              onClick={runBatchStatus}
            >
              {batchBusy ? 'Updating…' : 'Apply status to selected'}
            </button>
          </div>
          {batchResult && (
            <p className={batchResult.fail ? 'warn-text' : 'ok-text'}>
              Updated {batchResult.ok} / {batchResult.ok + batchResult.fail}. {batchResult.detail}
            </p>
          )}
        </div>
      )}

      {loading ? (
        <p className="muted">Loading animals…</p>
      ) : (
        <div className="table-wrap card pad-none">
          <table className="data-table">
            <thead>
              <tr>
                {canEditAnimal(user.role) && <th />}
                <th>ID</th>
                <th>Name</th>
                <th>Species</th>
                <th>Status</th>
                <th>Health</th>
                <th>Branch</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredForDisplay.map((a) => (
                <tr key={a.animal_id}>
                  {canEditAnimal(user.role) && (
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(a.animal_id)}
                        onChange={() => toggleSel(a.animal_id)}
                        aria-label={`Select ${a.name || a.animal_id}`}
                      />
                    </td>
                  )}
                  <td>{a.animal_id}</td>
                  <td>{a.name || '—'}</td>
                  <td>{a.species_name}</td>
                  <td>{a.status}</td>
                  <td>{a.health_status}</td>
                  <td>{a.branch_name}</td>
                  <td className="actions">
                    <Link to={`/animals/${a.animal_id}`} className="btn tiny ghost">
                      Open
                    </Link>
                    {canDeleteAnimal(user.role) && (
                      <button
                        type="button"
                        className="btn tiny danger"
                        onClick={() => removeAnimal(a.animal_id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="card modal">
            <h2>New animal</h2>
            <form onSubmit={createAnimal} className="stack two-col">
              <label>
                Name
                <input
                  value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                />
              </label>
              <label>
                Species *
                <select
                  value={createForm.species_id}
                  onChange={(e) => setCreateForm((f) => ({ ...f, species_id: e.target.value }))}
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
                  value={createForm.branch_id}
                  onChange={(e) => setCreateForm((f) => ({ ...f, branch_id: e.target.value }))}
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
                Intake method *
                <select
                  value={createForm.intake_method}
                  onChange={(e) => setCreateForm((f) => ({ ...f, intake_method: e.target.value }))}
                  required
                >
                  {INTAKE.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Breed
                <input
                  value={createForm.breed}
                  onChange={(e) => setCreateForm((f) => ({ ...f, breed: e.target.value }))}
                />
              </label>
              <label>
                Gender
                <select
                  value={createForm.gender}
                  onChange={(e) => setCreateForm((f) => ({ ...f, gender: e.target.value }))}
                >
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
                  value={createForm.health_status}
                  onChange={(e) => setCreateForm((f) => ({ ...f, health_status: e.target.value }))}
                >
                  {HEALTH.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Status
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm((f) => ({ ...f, status: e.target.value }))}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Weight (kg)
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={createForm.weight_kg}
                  onChange={(e) => setCreateForm((f) => ({ ...f, weight_kg: e.target.value }))}
                />
              </label>
              <label>
                Colour
                <input
                  value={createForm.colour}
                  onChange={(e) => setCreateForm((f) => ({ ...f, colour: e.target.value }))}
                />
              </label>
              <label>
                Date of birth
                <input
                  type="date"
                  value={createForm.date_of_birth}
                  onChange={(e) => setCreateForm((f) => ({ ...f, date_of_birth: e.target.value }))}
                />
              </label>
              <div className="full modal-actions">
                <button type="button" className="btn ghost" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
