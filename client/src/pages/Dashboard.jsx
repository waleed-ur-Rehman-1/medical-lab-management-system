import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [err, setErr] = useState('');

  useEffect(() => {
    setErr('');
    if (user.role === 'patient') {
      Promise.allSettled([
        api.get('/patients/me'),
        api.get('/results/me'),
        api.get('/invoices/me')
      ]).then(([p, r, i]) => {
        setStats({
          patientName: p.status === 'fulfilled' ? p.value.data.fullName : '',
          mrNumber:    p.status === 'fulfilled' ? p.value.data.mrNumber  : '',
          results:     r.status === 'fulfilled' ? r.value.data.length    : 0,
          invoices:    i.status === 'fulfilled' ? i.value.data.length    : 0
        });
      });
    } else {
      Promise.allSettled([
        api.get('/patients'),
        api.get('/orders'),
        api.get('/invoices')
      ]).then(([p, o, i]) => {
        setStats({
          patients: p.status === 'fulfilled' ? p.value.data.length : 0,
          orders:   o.status === 'fulfilled' ? o.value.data.length : 0,
          invoices: i.status === 'fulfilled' ? i.value.data.length : 0
        });
      });
    }
  }, [user.role]);

  if (user.role === 'patient') {
    return (
      <div>
        <h1>Welcome, {stats.patientName || user.name}</h1>
        {stats.mrNumber && <p>MR: <strong>{stats.mrNumber}</strong></p>}
        {err && <p className="error">{err}</p>}
        <div className="grid">
          <div className="stat">
            <h3>{stats.results}</h3>
            <p>Approved Results</p>
            <Link to="/my/results">View →</Link>
          </div>
          <div className="stat">
            <h3>{stats.invoices}</h3>
            <p>Invoices</p>
            <Link to="/my/invoices">View →</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboard</h1>
      {err && <p className="error">{err}</p>}
      <div className="grid">
        <div className="stat"><h3>{stats.patients ?? 0}</h3><p>Patients</p></div>
        <div className="stat"><h3>{stats.orders   ?? 0}</h3><p>Orders</p></div>
        <div className="stat"><h3>{stats.invoices ?? 0}</h3><p>Invoices</p></div>
      </div>
    </div>
  );
}