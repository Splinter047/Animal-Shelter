import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { canCreateAnimal, canEditAnimal } from '../auth/rbac.js';

export default function MedicalRecords() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [animal, setAnimal] = useState(null);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    diagnosis: '',
    treatment_plan: '',
    medication_prescribed: '',
    cost: '0',
    visit_date: new Date().toISOString().split('T')[0],
    next_visit_date: ''
  });

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [a, r] = await Promise.all([
        api(`/animals/${id}`, { token }),
        api(`/medical-records/${id}`, { token })
      ]);
      setAnimal(a);
      setRecords(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id, token]);

  async function submit(e) {
    e.preventDefault();
    try {
      await api(`/medical-records/${id}`, {
        method: 'POST',
        token,
        body: {
          ...form,
          cost: Number(form.cost),
          next_visit_date: form.next_visit_date || null
        }
      });
      showToast({ type: 'success', message: 'Medical record added.' });
      setShowAdd(false);
      setForm({
        diagnosis: '',
        treatment_plan: '',
        medication_prescribed: '',
        cost: '0',
        visit_date: new Date().toISOString().split('T')[0],
        next_visit_date: ''
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeRecord(recordId) {
    if (!window.confirm('Delete this medical record?')) return;
    try {
      await api(`/medical-records/${recordId}`, { method: 'DELETE', token });
      showToast({ type: 'success', message: 'Record deleted.' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading && !animal) return <p className="centered muted">Loading records…</p>;

  return (
    <div className="page">
      <div className="page-header row">
        <div>
          <p><Link to={`/animals/${id}`}>← Back to {animal?.name || 'Animal'}</Link></p>
          <h1>Medical History</h1>
          <p className="muted">Clinical visits, diagnoses, and treatments for {animal?.name || `#${id}`}</p>
        </div>
        {canEditAnimal(user.role) && (
          <button className="btn primary" onClick={() => setShowAdd(true)}>Add record</button>
        )}
      </div>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      {showAdd && (
        <div className="modal-backdrop">
          <div className="card modal">
            <h2>New Medical Record</h2>
            <form onSubmit={submit} className="stack two-col">
              <label>
                Visit Date
                <input type="date" value={form.visit_date} onChange={e => setForm({...form, visit_date: e.target.value})} required />
              </label>
              <label>
                Diagnosis *
                <input value={form.diagnosis} onChange={e => setForm({...form, diagnosis: e.target.value})} required placeholder="e.g. Skin infection" />
              </label>
              <label className="full">
                Treatment Plan
                <textarea rows={3} value={form.treatment_plan} onChange={e => setForm({...form, treatment_plan: e.target.value})} />
              </label>
              <label className="full">
                Medication Prescribed
                <input value={form.medication_prescribed} onChange={e => setForm({...form, medication_prescribed: e.target.value})} />
              </label>
              <label>
                Cost (PKR)
                <input type="number" step="0.01" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} />
              </label>
              <label>
                Next Visit Date
                <input type="date" value={form.next_visit_date} onChange={e => setForm({...form, next_visit_date: e.target.value})} />
              </label>
              <div className="full modal-actions">
                <button type="button" className="btn ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn primary">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="stack">
        {records.map(r => (
          <div key={r.record_id} className="card">
            <div className="row" style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
              <div>
                <span className="role-pill" style={{marginLeft:0, marginBottom:'0.5rem', display:'inline-block'}}>
                  {new Date(r.visit_date).toLocaleDateString()}
                </span>
                <h3 style={{margin:0}}>{r.diagnosis}</h3>
                <p className="small muted">Attended by {r.employee_name}</p>
              </div>
              {user.role === 'Manager' && (
                <button className="btn tiny danger" onClick={() => removeRecord(r.record_id)}>Delete</button>
              )}
            </div>
            <div className="grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1rem', marginTop:'1rem'}}>
              <div>
                <h4 className="small muted" style={{textTransform:'uppercase', margin:'0 0 0.25rem 0'}}>Treatment</h4>
                <p style={{margin:0}}>{r.treatment_plan || '—'}</p>
              </div>
              <div>
                <h4 className="small muted" style={{textTransform:'uppercase', margin:'0 0 0.25rem 0'}}>Medication</h4>
                <p style={{margin:0}}>{r.medication_prescribed || '—'}</p>
              </div>
              <div>
                <h4 className="small muted" style={{textTransform:'uppercase', margin:'0 0 0.25rem 0'}}>Cost</h4>
                <p style={{margin:0}}>{r.cost} PKR</p>
              </div>
              {r.next_visit_date && (
                <div>
                  <h4 className="small muted" style={{textTransform:'uppercase', margin:'0 0 0.25rem 0'}}>Follow-up</h4>
                  <p style={{margin:0}} className="warn-text">{new Date(r.next_visit_date).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {records.length === 0 && <p className="centered muted">No medical records found for this animal.</p>}
      </div>
    </div>
  );
}
