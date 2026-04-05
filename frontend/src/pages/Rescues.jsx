import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { canManageMissions, canViewRescueReports } from '../auth/rbac.js';

const REPORT_STATUSES = ['Pending', 'Assigned', 'Resolved', 'Closed'];
const OUTCOMES = ['Ongoing', 'Rescued', 'Not Found', 'Cancelled'];

export default function Rescues() {
  const { token, user } = useAuth();
  const [tab, setTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [missions, setMissions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [species, setSpecies] = useState([]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [missionForm, setMissionForm] = useState({ report_id: '', team_id: '' });
  
  const [showRescuedModal, setShowRescuedModal] = useState(false);
  const [rescuingMissionId, setRescuingMissionId] = useState(null);
  const [rescuedAnimalForm, setRescuedAnimalForm] = useState({
    name: '',
    species_id: '',
    breed: '',
    gender: 'U',
    health_status: 'Injured',
    image: null
  });

  async function loadReports() {
    const r = await api('/rescues/reports', { token });
    setReports(r);
  }

  async function loadMissions() {
    const m = await api('/rescues/missions', { token });
    setMissions(m);
  }

  async function loadTeams() {
    const t = await api('/lookup/rescue-teams', { token });
    setTeams(t);
  }

  async function loadMissionLookups() {
    const [a, s] = await Promise.all([
      api('/animals?status=In%20Shelter', { token }),
      api('/lookup/species', { token })
    ]);
    setAnimals(a);
    setSpecies(s);
  }

  async function refresh() {
    setError('');
    try {
      await loadReports();
      if (canViewRescueReports(user.role)) {
        await loadTeams();
      }
      if (canManageMissions(user.role)) {
        await loadMissions();
        await loadMissionLookups();
      }
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    refresh();
  }, [token, user.role]);

  async function patchReport(id, body) {
    setError('');
    setInfo('');
    try {
      await api(`/rescues/reports/${id}`, { method: 'PATCH', token, body });
      setInfo('Report updated.');
      loadReports();
    } catch (e) {
      setError(e.message);
    }
  }

  async function createMission(e) {
    e.preventDefault();
    setError('');
    setInfo('');
    try {
      await api('/rescues/missions', {
        method: 'POST',
        token,
        body: {
          team_id: Number(missionForm.team_id),
          report_id: missionForm.report_id ? Number(missionForm.report_id) : undefined,
        },
      });
      setInfo(
        'Mission created in a transaction: report assignment and mission row are committed together.'
      );
      setMissionForm({ report_id: '', team_id: '' });
      loadMissions();
      loadReports();
    } catch (e) {
      setError(e.message || 'Mission transaction rolled back (e.g. inactive team).');
    }
  }

  async function patchMission(id, body) {
    setError('');
    setInfo('');
    try {
      const isFormData = body instanceof FormData;
      await api(`/rescues/missions/${id}`, { 
        method: 'PATCH', 
        token, 
        body 
      });
      setInfo('Mission updated.');
      loadMissions();
      loadReports();
    } catch (e) {
      setError(e.message);
    }
  }

  async function submitRescuedAnimal(e) {
    e.preventDefault();
    if (!rescuingMissionId) return;
    
    try {
      const formData = new FormData();
      formData.append('outcome', 'Rescued');
      formData.append('animal_data', JSON.stringify({
        name: rescuedAnimalForm.name || null,
        species_id: Number(rescuedAnimalForm.species_id),
        breed: rescuedAnimalForm.breed || null,
        gender: rescuedAnimalForm.gender,
        health_status: rescuedAnimalForm.health_status,
      }));
      if (rescuedAnimalForm.image) {
        formData.append('image', rescuedAnimalForm.image);
      }
      formData.append('completed_at', new Date().toISOString());

      await patchMission(rescuingMissionId, formData);
      setShowRescuedModal(false);
      setRescuingMissionId(null);
      setRescuedAnimalForm({
        name: '',
        species_id: '',
        breed: '',
        gender: 'U',
        health_status: 'Injured',
        image: null
      });
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Rescues</h1>
        <p className="muted">Reports and missions. Mission creation uses an atomic DB transaction.</p>
      </div>
      <ErrorBanner message={error} onDismiss={() => setError('')} />
      {info && (
        <div className="banner ok" role="status">
          {info}
        </div>
      )}

      <div className="tabs">
        <button type="button" className={tab === 'reports' ? 'active' : ''} onClick={() => setTab('reports')}>
          Reports
        </button>
        {canManageMissions(user.role) && (
          <button type="button" className={tab === 'missions' ? 'active' : ''} onClick={() => setTab('missions')}>
            Missions
          </button>
        )}
      </div>

      {tab === 'reports' && (
        <div className="card pad-none table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>When</th>
                <th>Location</th>
                <th>Status</th>
                <th>Team</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.report_id}>
                  <td>{r.report_id}</td>
                  <td>{new Date(r.reported_at).toLocaleString()}</td>
                  <td>{r.location_text}</td>
                  <td>{r.status}</td>
                  <td>{r.team_name || '—'}</td>
                  <td>
                    <div className="inline wrap">
                      <select
                        defaultValue={r.status}
                        onChange={(e) => patchReport(r.report_id, { status: e.target.value })}
                      >
                        {REPORT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <select
                        defaultValue={r.assigned_team_id || ''}
                        onChange={(e) =>
                          patchReport(r.report_id, {
                            assigned_team_id: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                      >
                        <option value="">Team…</option>
                        {teams.map((t) => (
                          <option key={t.team_id} value={t.team_id}>
                            {t.team_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'missions' && canManageMissions(user.role) && (
        <>
          <div className="card">
            <h2>Dispatch mission</h2>
            <form onSubmit={createMission} className="stack inline-form">
              <label>
                Report (optional)
                <select
                  value={missionForm.report_id}
                  onChange={(e) => setMissionForm({ ...missionForm, report_id: e.target.value })}
                >
                  <option value="">None</option>
                  {reports.map((r) => (
                    <option key={r.report_id} value={r.report_id}>
                      #{r.report_id} — {r.location_text.slice(0, 40)}…
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Team *
                <select
                  value={missionForm.team_id}
                  onChange={(e) => setMissionForm({ ...missionForm, team_id: e.target.value })}
                  required
                >
                  <option value="">Select…</option>
                  {teams.map((t) => (
                    <option key={t.team_id} value={t.team_id}>
                      {t.team_name}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="btn primary">
                Create
              </button>
            </form>
          </div>

          <div className="card pad-none table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Team</th>
                  <th>Outcome</th>
                  <th>Animal</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {missions.map((m) => (
                  <tr key={m.mission_id}>
                    <td>{m.mission_id}</td>
                    <td>{m.team_name}</td>
                    <td>{m.outcome}</td>
                    <td>{m.animal_name || '—'}</td>
                    <td>
                      <div className="stack tight">
                        <select
                          value={m.outcome}
                          onChange={(e) => {
                            if (e.target.value === 'Rescued' && !m.animal_id) {
                              setRescuingMissionId(m.mission_id);
                              setShowRescuedModal(true);
                            } else {
                              patchMission(m.mission_id, { outcome: e.target.value });
                            }
                          }}
                        >
                          {OUTCOMES.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                        <select
                          defaultValue={m.animal_id || ''}
                          onChange={(e) =>
                            patchMission(m.mission_id, {
                              animal_id: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                        >
                          <option value="">Link animal…</option>
                          {animals.map((a) => (
                            <option key={a.animal_id} value={a.animal_id}>
                              #{a.animal_id} {a.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showRescuedModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="card modal">
            <h2>Success! Create Animal Record</h2>
            <p className="muted small">This animal will be added to the database and linked to this mission.</p>
            <form onSubmit={submitRescuedAnimal} className="stack two-col">
              <label>
                Name
                <input
                  value={rescuedAnimalForm.name}
                  onChange={(e) => setRescuedAnimalForm({ ...rescuedAnimalForm, name: e.target.value })}
                  placeholder="e.g. Buddy (leave empty if unknown)"
                />
              </label>
              <label>
                Species *
                <select
                  value={rescuedAnimalForm.species_id}
                  onChange={(e) => setRescuedAnimalForm({ ...rescuedAnimalForm, species_id: e.target.value })}
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
                Breed
                <input
                  value={rescuedAnimalForm.breed}
                  onChange={(e) => setRescuedAnimalForm({ ...rescuedAnimalForm, breed: e.target.value })}
                />
              </label>
              <label>
                Gender
                <select
                  value={rescuedAnimalForm.gender}
                  onChange={(e) => setRescuedAnimalForm({ ...rescuedAnimalForm, gender: e.target.value })}
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="U">Unknown</option>
                </select>
              </label>
              <label>
                Health Status
                <select
                  value={rescuedAnimalForm.health_status}
                  onChange={(e) => setRescuedAnimalForm({ ...rescuedAnimalForm, health_status: e.target.value })}
                >
                  <option value="Injured">Injured</option>
                  <option value="Sick">Sick</option>
                  <option value="Healthy">Healthy</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </label>
              <label className="full">
                Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setRescuedAnimalForm({ ...rescuedAnimalForm, image: e.target.files[0] })}
                />
              </label>
              <div className="full modal-actions">
                <button 
                  type="button" 
                  className="btn ghost" 
                  onClick={() => {
                    setShowRescuedModal(false);
                    setRescuingMissionId(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Save Animal & Complete Mission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
