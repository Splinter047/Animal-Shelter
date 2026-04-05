import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';

export default function GlobalSearch() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const [results, setResults] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    api(`/lookup/search?q=${encodeURIComponent(debouncedQuery)}`, { token })
      .then((data) => {
        setResults(data);
        setIsOpen(true);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedQuery, token]);

  const handleSelect = (type, id) => {
    setQuery('');
    setIsOpen(false);
    if (type === 'animal') navigate(`/animals/${id}`);
    if (type === 'employee') navigate(`/employees`); // Employees is a list page
  };

  return (
    <div className="global-search" ref={wrapperRef}>
      <input
        type="search"
        placeholder="Search animals, staff..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
      />
      {isOpen && results && (
        <div className="search-results card">
          {results.animals.length === 0 && results.employees.length === 0 && (
            <div className="search-item muted">No results found</div>
          )}
          
          {results.animals.length > 0 && (
            <div className="search-section">
              <div className="search-header">Animals</div>
              {results.animals.map((a) => (
                <div key={a.animal_id} className="search-item" onClick={() => handleSelect('animal', a.animal_id)}>
                  <span className="name">{a.name || 'Unnamed'}</span>
                  <span className="meta">#{a.animal_id} · {a.species} · {a.status}</span>
                </div>
              ))}
            </div>
          )}

          {results.employees.length > 0 && (
            <div className="search-section">
              <div className="search-header">Staff</div>
              {results.employees.map((e) => (
                <div key={e.employee_id} className="search-item" onClick={() => handleSelect('employee', e.employee_id)}>
                  <span className="name">{e.first_name} {e.last_name}</span>
                  <span className="meta">{e.email}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
