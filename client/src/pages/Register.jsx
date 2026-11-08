import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/auth/setup-status')
      .then(r => setStatus(r.data))
      .catch(() => setStatus({ needsSetup: false, adminExists: true }));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      await register({ ...form, role: 'admin' });
      nav('/');
    } catch (e) {
      setErr(e.response?.data?.message || 'Registration failed');
    }
  }

  if (status === null) return <div className="auth"><div className="card"><p>Loading…</p></div></div>;

  if (status.adminExists) {
    return (
      <div className="auth">
        <div className="card">
          <h1>🔒 Registration Disabled</h1>
          <p style={{ color: '#374151', lineHeight: 1.6 }}>
            An administrator account already exists in this system.<br /><br />
            New users must be created by the administrator from the <strong>Admin → Users</strong> panel.
          </p>
          <button onClick={() => nav('/login')}>← Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth">
      <form onSubmit={submit} className="card">
        <h1>🔧 First-Time Setup</h1>
        <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.5 }}>
          Create the initial administrator. Once created, this page is permanently disabled.
        </p>
        <label>Full Name
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>Email
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label>Password (min 8 characters)
          <input type="password" minLength={8} value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required />
        </label>
        {err && <p className="error">{err}</p>}
        <button type="submit">Create Admin Account</button>
        <p style={{ marginTop: 12, fontSize: 13, textAlign: 'center' }}>
          <Link to="/login">Already have an account? Login</Link>
        </p>
      </form>
    </div>
  );
}