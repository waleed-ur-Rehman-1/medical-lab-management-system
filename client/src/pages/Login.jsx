import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState('staff'); // 'staff' or 'patient'
  const [err, setErr] = useState('');
  const [needsSetup, setNeedsSetup] = useState(false);

  // Staff fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Patient fields
  const [mrNumber, setMrNumber] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    api.get('/auth/setup-status')
      .then(r => setNeedsSetup(r.data.needsSetup))
      .catch(() => setNeedsSetup(false));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    
    try {
      if (mode === 'staff') {
        await login(email, password);
      } else {
        // Patient login
        const r = await api.post('/auth/patient-login', { mrNumber, fullName });
        localStorage.setItem('token', r.data.token);
        window.location.href = '/'; // Force reload to update AuthContext
      }
      nav('/');
    } catch (e) {
      setErr(e.response?.data?.message || 'Login failed. Please try again.');
    }
  }

  return (
    <div className="auth">
      <form onSubmit={submit} className="card">
        <h1>MLMIS Portal</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button 
            type="button"
            onClick={() => { setMode('staff'); setErr(''); }}
            style={{ flex: 1, background: mode === 'staff' ? '#2563eb' : '#e5e7eb', color: mode === 'staff' ? '#fff' : '#374151' }}
          >
            Staff Login
          </button>
          <button 
            type="button"
            onClick={() => { setMode('patient'); setErr(''); }}
            style={{ flex: 1, background: mode === 'patient' ? '#2563eb' : '#e5e7eb', color: mode === 'patient' ? '#fff' : '#374151' }}
          >
            Patient Portal
          </button>
        </div>

        {/* Staff Login Fields */}
        {mode === 'staff' && (
          <>
            <label>Email
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </label>
            <label>Password
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
            </label>
          </>
        )}

        {/* Patient Login Fields */}
        {mode === 'patient' && (
          <>
            <label>MR Number
              <input 
                value={mrNumber} 
                onChange={e => setMrNumber(e.target.value.toUpperCase())} 
                placeholder="e.g. MR-2026-123456" 
                required 
              />
            </label>
            <label>Full Name
              <input 
                value={fullName} 
                onChange={e => setFullName(e.target.value)} 
                placeholder="e.g. John Doe" 
                required 
              />
            </label>
          </>
        )}

        {err && <p className="error">{err}</p>}

        <button type="submit" style={{ marginTop: 10 }}>
          {mode === 'staff' ? 'Sign In' : 'View My Results'}
        </button>

        {needsSetup && mode === 'staff' && (
          <p style={{ marginTop: 12, fontSize: 13, textAlign: 'center' }}>
            No admin yet? <Link to="/register">First-time setup →</Link>
          </p>
        )}
      </form>
    </div>
  );
}