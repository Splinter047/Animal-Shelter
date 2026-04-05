import { useEffect, useState } from 'react';

function healthUrl() {
  const api = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
  return api.replace(/\/?api\/v1\/?$/, '') + '/api/v1/health';
}

export default function ApiHealthBadge() {
  const [state, setState] = useState('checking');

  useEffect(() => {
    let cancelled = false;

    async function ping() {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 5000);
      try {
        const r = await fetch(healthUrl(), { signal: ctrl.signal });
        if (!cancelled) setState(r.ok ? 'ok' : 'error');
      } catch {
        if (!cancelled) setState('error');
      } finally {
        clearTimeout(tid);
      }
    }

    ping();
    const id = setInterval(ping, 30000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const label =
    state === 'ok' ? 'API online' : state === 'error' ? 'API unreachable' : 'Checking API…';

  return (
    <span className={`api-badge api-badge--${state}`} title={label} aria-label={label}>
      <span className="api-badge-dot" />
      <span className="api-badge-text">{state === 'ok' ? 'API' : state === 'error' ? 'Offline' : '…'}</span>
    </span>
  );
}
