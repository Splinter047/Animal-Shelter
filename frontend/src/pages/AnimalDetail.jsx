import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { canCreateCareLog, canEditAnimal, canEditCareLog } from '../auth/rbac.js';

const CARE_TYPES = ['Vaccination', 'Treatment', 'Feeding', 'Check-up', 'Other'];
const STATUSES = ['In Shelter', 'Adopted', 'Sold', 'Deceased', 'Released'];
const HEALTH = ['Healthy', 'Injured', 'Sick', 'Recovering', 'Unknown'];
const GENDERS = [
  { v: 'M', l: 'Male' },
  { v: 'F', l: 'Female' },
  { v: 'U', l: 'Unknown' },
];

const IMAGE_BASE = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
  : 'http://localhost:3000';

export default function AnimalDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [animal, setAnimal] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [edit, setEdit] = useState({});
  const [logForm, setLogForm] = useState({ care_type: 'Check-up', notes: '', cost: '0' });
  const [editingLog, setEditingLog] = useState(null);
  const [branches, setBranches] = useState([]);

  async function load() {
    setError('');
    try {
      const [a, l, br] = await Promise.all([
        api(`/animals/${id}`, { token }),
        api(`/animals/${id}/care-logs`, { token }),
        api('/lookup/branches', { token }),
      ]);
      setBranches(br);
      setAnimal(a);
      setEdit({
        name: a.name || '',
        breed: a.breed || '',
        gender: a.gender || 'U',
        colour: a.colour || '',
        weight_kg: a.weight_kg ?? '',
        health_status: a.health_status,
        status: a.status,
        branch_id: a.branch_id,
        date_of_birth: a.date_of_birth || '',
        image: null,
      });
      setLogs(l);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, [id, token]);

  async function saveAnimal(e) {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', edit.name || '');
      formData.append('breed', edit.breed || '');
      formData.append('gender', edit.gender);
      formData.append('colour', edit.colour || '');
      if (edit.weight_kg !== '') formData.append('weight_kg', Number(edit.weight_kg));
      formData.append('health_status', edit.health_status);
      formData.append('status', edit.status);
      if (edit.branch_id) formData.append('branch_id', Number(edit.branch_id));
      if (edit.date_of_birth) formData.append('date_of_birth', edit.date_of_birth);
      if (edit.image) formData.append('image', edit.image);

      await api(`/animals/${id}`, {
        method: 'PATCH',
        token,
        body: formData,
      });
      showToast({ type: 'success', message: 'Animal profile updated.' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function addLog(e) {
    e.preventDefault();
    try {
      await api(`/animals/${id}/care-logs`, {
        method: 'POST',
        token,
        body: {
          care_type: logForm.care_type,
          notes: logForm.notes || null,
          cost: logForm.cost ? Number(logForm.cost) : 0,
        },
      });
      showToast({ type: 'success', message: 'Care log added.' });
      setLogForm({ care_type: 'Check-up', notes: '', cost: '0' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveLog(e) {
    e.preventDefault();
    if (!editingLog) return;
    try {
      await api(`/animals/${id}/care-logs/${editingLog.log_id}`, {
        method: 'PATCH',
        token,
        body: {
          care_type: editingLog.care_type,
          notes: editingLog.notes,
          cost: editingLog.cost != null ? Number(editingLog.cost) : 0,
        },
      });
      showToast({ type: 'success', message: 'Care log updated.' });
      setEditingLog(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function delLog(logId) {
    if (!window.confirm('Delete this care log?')) return;
    try {
      await api(`/animals/${id}/care-logs/${logId}`, { method: 'DELETE', token });
      showToast({ type: 'success', message: 'Care log removed.' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!animal && !error) {
    return <p className="muted">Loading…</p>;
  }

  return (
    <div className="page">
      <p>
        <Link to="/animals">← Animals</Link>
      </p>
      <ErrorBanner message={error} onDismiss={() => setError('')} />
      {animal && (
        <>
          <div className="page-header">
            {animal.image_url && (
              <img 
                src={`${IMAGE_BASE}${animal.image_url}`} 
                alt={animal.name} 
                style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }}
              />
            )}
            <h1>{animal.name || `Animal #${animal.animal_id}`}</h1>
            <p className="muted">
              {animal.species_name} · {animal.branch_name}, {animal.city_name}
            </p>
          </div>

          {canEditAnimal(user.role) ? (
            <form className="card stack two-col" onSubmit={saveAnimal}>
              <h2 className="full">Edit profile</h2>
              <label>
                Name
                <input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
              </label>
              <label>
                Breed
                <input value={edit.breed} onChange={(e) => setEdit({ ...edit, breed: e.target.value })} />
              </label>
              <label>
                Gender
                <select
                  value={edit.gender}
                  onChange={(e) => setEdit({ ...edit, gender: e.target.value })}
                >
                  {GENDERS.map((g) => (
                    <option key={g.v} value={g.v}>
                      {g.l}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Colour
                <input value={edit.colour} onChange={(e) => setEdit({ ...edit, colour: e.target.value })} />
              </label>
              <label>
                Weight kg
                <input
                  type="number"
                  step="0.01"
                  value={edit.weight_kg}
                  onChange={(e) => setEdit({ ...edit, weight_kg: e.target.value })}
                />
              </label>
              <label>
                Health
                <select
                  value={edit.health_status}
                  onChange={(e) => setEdit({ ...edit, health_status: e.target.value })}
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
                  value={edit.status}
                  onChange={(e) => setEdit({ ...edit, status: e.target.value })}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Branch
                <select
                  value={edit.branch_id}
                  onChange={(e) => setEdit({ ...edit, branch_id: Number(e.target.value) })}
                >
                  {branches.map((b) => (
                    <option key={b.branch_id} value={b.branch_id}>
                      {b.branch_name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Date of birth
                <input
                  type="date"
                  value={edit.date_of_birth || ''}
                  onChange={(e) => setEdit({ ...edit, date_of_birth: e.target.value })}
                />
              </label>
              <label className="full">
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEdit({ ...edit, image: e.target.files[0] })}
                />
              </label>
              <div className="full">
                <button type="submit" className="btn primary">
                  Save changes
                </button>
              </div>
            </form>
          ) : (
            <div className="card">
              <h2>Profile</h2>
              <dl className="dl-grid">
                <dt>Status</dt>
                <dd>{animal.status}</dd>
                <dt>Health</dt>
                <dd>{animal.health_status}</dd>
                <dt>Intake</dt>
                <dd>{animal.intake_method}</dd>
              </dl>
            </div>
          )}

          <section className="card">
            <h2>Care logs</h2>
            {canCreateCareLog(user.role) && (
              <form onSubmit={addLog} className="stack inline-form">
                <select
                  value={logForm.care_type}
                  onChange={(e) => setLogForm({ ...logForm, care_type: e.target.value })}
                >
                  {CARE_TYPES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Notes"
                  value={logForm.notes}
                  onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Cost"
                  value={logForm.cost}
                  onChange={(e) => setLogForm({ ...logForm, cost: e.target.value })}
                />
                <button type="submit" className="btn primary">
                  Add log
                </button>
              </form>
            )}
            <ul className="log-list">
              {logs.map((log) => (
                <li key={log.log_id}>
                  {editingLog?.log_id === log.log_id ? (
                    <form onSubmit={saveLog} className="stack">
                      <select
                        value={editingLog.care_type}
                        onChange={(e) => setEditingLog({ ...editingLog, care_type: e.target.value })}
                      >
                        {CARE_TYPES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <input
                        value={editingLog.notes || ''}
                        onChange={(e) => setEditingLog({ ...editingLog, notes: e.target.value })}
                      />
                      <input
                        type="number"
                        value={editingLog.cost}
                        onChange={(e) => setEditingLog({ ...editingLog, cost: e.target.value })}
                      />
                      <div className="inline">
                        <button type="submit" className="btn primary tiny">
                          Save
                        </button>
                        <button
                          type="button"
                          className="btn ghost tiny"
                          onClick={() => setEditingLog(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <strong>{log.care_type}</strong> — {log.log_date}{' '}
                      <span className="muted">({log.employee_name})</span>
                      {log.notes && <p>{log.notes}</p>}
                      <p className="small muted">Cost: {log.cost}</p>
                      {canEditCareLog(user.role) && (
                        <div className="inline">
                          <button
                            type="button"
                            className="btn tiny ghost"
                            onClick={() => setEditingLog({ ...log })}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn tiny danger"
                            onClick={() => delLog(log.log_id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
