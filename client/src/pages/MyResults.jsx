import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function MyResults() {
  const [results, setResults] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/results/me')
      .then(r => setResults(r.data))
      .catch(e => setErr(e.response?.data?.message || 'Failed to load results'));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>My Reports</h1>
      </div>

      {err && <p className="error">{err}</p>}
      {results.length === 0 && !err && (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <p className="muted">No reports available yet.</p>
          <p className="muted small">If you just visited the lab, your results might still be processing.</p>
        </div>
      )}

      {results.map(r => (
        <div key={r._id} className="card" style={{ marginBottom: 20 }}>
          <div className="page-header" style={{ marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0 }}>{r.test?.testName || 'Lab Report'}</h3>
              <p className="muted" style={{ margin: '4px 0 0 0', fontSize: 13 }}>
                Date: {new Date(r.order?.createdAt || r.createdAt).toLocaleDateString()} 
                {' · '} 
                Order: {r.order?.orderNumber}
              </p>
            </div>
            <Link
              to={`/print/result/${r._id}`}
              target="_blank"
              rel="noopener"
              className="btn"
              style={{ background: '#2563eb', color: '#fff', textDecoration: 'none', padding: '8px 16px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 500 }}
            >
              🖨️ Print PDF
            </Link>
          </div>

          <table>
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Result</th>
                <th>Unit</th>
                <th>Reference Range</th>
              </tr>
            </thead>
            <tbody>
              {r.values.map((v, i) => (
                <tr key={i}>
                  <td>{v.parameterName}</td>
                  <td style={{ fontWeight: 'bold', color: v.flag === 'high' ? '#dc2626' : v.flag === 'low' ? '#d97706' : 'inherit' }}>
                    {v.value || '—'}
                    {v.flag === 'high' && ' ↑'}
                    {v.flag === 'low' && ' ↓'}
                  </td>
                  <td>{v.unit}</td>
                  <td>{v.referenceRange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}