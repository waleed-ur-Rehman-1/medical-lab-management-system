import { useEffect, useState } from 'react';
import api from '../api/axios.js';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [err, setErr] = useState('');
  const [entity, setEntity] = useState('');

  async function load() {
    setErr('');
    try {
      const params = entity ? { entity } : {};
      const r = await api.get('/admin/audit-logs', { params });
      setLogs(r.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to load logs');
    }
  }
  useEffect(() => { load(); }, [entity]);

  return (
    <div>
      <h1>Audit Logs</h1>
      {err && <p className="error">{err}</p>}

      <div className="card">
        <div className="row">
          <label>Filter by entity
            <select value={entity} onChange={e => setEntity(e.target.value)}>
              <option value="">All</option>
              <option>Patient</option>
              <option>Result</option>
              <option>Invoice</option>
              <option>User</option>
            </select>
          </label>
          <button onClick={load}>Refresh</button>
        </div>
      </div>

      <div className="card">
        {logs.length === 0 && <p>No audit entries yet. Actions will appear here as staff work.</p>}
        <table>
          <thead>
            <tr>
              <th>Time</th><th>Actor</th><th>Action</th><th>Entity</th><th>IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l._id}>
                <td>{new Date(l.timestamp || l.createdAt).toLocaleString()}</td>
                <td>{l.actor?.name || '—'} ({l.actor?.role || '—'})</td>
                <td><strong>{l.action}</strong></td>
                <td>{l.entity} {l.entityId ? `· ${String(l.entityId).slice(-6)}` : ''}</td>
                <td>{l.ip || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}