import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function MyResults() {
  const [results, setResults] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/results/me')
      .then(r => setResults(r.data))
      .catch(e => setErr(e.response?.data?.message || 'Failed'));
  }, []);

  return (
    <div>
      <h1>My Results</h1>
      {err && <p className="error">{err}</p>}
      {results.length === 0 && !err && <p>No approved results yet.</p>}

      {results.map(r => (
        <div key={r._id} className="card">
          <div className="page-header">
            <h3>{r.test?.testName || 'Test'}</h3>
            <Link to={`/print/result/${r._id}`} target="_blank" rel="noopener" className="btn">
              🖨️ Print / Save PDF
            </Link>
          </div>
          <p>Order: {r.order?.orderNumber} · Approved: {r.verifiedAt ? new Date(r.verifiedAt).toLocaleString() : '—'}</p>
          <table>
            <thead><tr><th>Parameter</th><th>Value</th><th>Unit</th><th>Reference</th><th>Flag</th></tr></thead>
            <tbody>
              {r.values.map((v, i) => (
                <tr key={i}>
                  <td>{v.parameterName}</td>
                  <td>{v.value}</td>
                  <td>{v.unit}</td>
                  <td>{v.referenceRange}</td>
                  <td>{v.flag}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}