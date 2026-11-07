import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LinkAccount() {
  const { user, refresh, logout } = useAuth();
  const nav = useNavigate();
  const [mrNumber, setMrNumber] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  // If already linked, send home
  if (user?.patientProfile) {
    return (
      <div className="auth">
        <div className="card">
          <h1>Account already linked</h1>
          <button onClick={() => nav('/')}>Go to Dashboard</button>
        </div>
      </div>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await api.post('/auth/link-patient', { mrNumber, contactNumber });
      await refresh();
      nav('/');
    } catch (e) {
      setErr(e.response?.data?.message || 'Link failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <form onSubmit={submit} className="card">
        <h1>Link Your Account</h1>
        <p>Enter the MR number and contact phone from your lab report to link your patient record.</p>
        <label>MR Number
          <input value={mrNumber} onChange={e => setMrNumber(e.target.value)}
            placeholder="e.g. MR-2026-123456" required />
        </label>
        <label>Contact Number
          <input value={contactNumber} onChange={e => setContactNumber(e.target.value)}
            placeholder="as registered at the lab" required />
        </label>
        {err && <p className="error">{err}</p>}
        <button type="submit" disabled={busy}>{busy ? 'Linking…' : 'Link Account'}</button>
        <button type="button" onClick={() => { logout(); nav('/login'); }}>Cancel</button>
      </form>
    </div>
  );
}