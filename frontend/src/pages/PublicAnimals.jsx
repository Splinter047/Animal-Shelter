import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';

const IMAGE_BASE = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api/v1', '') 
  : 'http://localhost:3000';

export default function PublicAnimals() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/public/animals')
      .then(setAnimals)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="auth-page">
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1>Available for Adoption</h1>
            <p className="muted">Find your new best friend!</p>
          </div>
          <Link to="/login" className="btn ghost">Staff Login</Link>
        </div>

        {loading ? (
          <p>Loading animals...</p>
        ) : error ? (
          <p className="warn-text">{error}</p>
        ) : animals.length === 0 ? (
          <p>No animals available for adoption at the moment. Please check back later!</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {animals.map((a) => (
              <div key={a.animal_id} className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '200px', width: '100%', backgroundColor: '#eee' }}>
                  {a.image_url ? (
                    <img 
                      src={`${IMAGE_BASE}${a.image_url}`} 
                      alt={a.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                      No Photo Available
                    </div>
                  )}
                </div>
                <div style={{ padding: '1.2rem', flexGrow: 1 }}>
                  <h2 style={{ margin: '0 0 0.5rem 0' }}>{a.name || 'Unnamed Animal'}</h2>
                  <div className="muted small" style={{ marginBottom: '1rem' }}>
                    {a.species_name} · {a.breed || 'Unknown breed'}
                  </div>
                  <dl className="dl-grid" style={{ fontSize: '0.9rem' }}>
                    <dt>Gender</dt>
                    <dd>{a.gender === 'M' ? 'Male' : a.gender === 'F' ? 'Female' : 'Unknown'}</dd>
                    <dt>Branch</dt>
                    <dd>{a.branch_name}, {a.city_name}</dd>
                    <dt>Status</dt>
                    <dd><span className="ok-text">{a.health_status}</span></dd>
                  </dl>
                </div>
                <div style={{ padding: '1rem', borderTop: '1px solid #eee' }}>
                  <Link to="/report-stray" className="btn primary full" style={{ textAlign: 'center' }}>
                    Inquire About {a.name || 'this animal'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <p className="muted">Seen a stray animal in need? <Link to="/report-stray">Submit a report</Link></p>
        </div>
      </div>
    </div>
  );
}
