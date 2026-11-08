import { useEffect, useState } from 'react';
import api from '../api/axios.js';

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/patients/me')
      .then(r => setProfile(r.data))
      .catch(e => setErr(e.response?.data?.message || 'Failed to load profile'));
  }, []);

  if (err) return <p className="error">{err}</p>;
  if (!profile) return <p>Loading profile…</p>;

  return (
    <div>
      <div className="page-header">
        <h1>My Profile</h1>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#6b7280' }}>
            👤
          </div>
          <div>
            <h2 style={{ margin: 0 }}>{profile.fullName}</h2>
            <p className="muted" style={{ margin: '4px 0 0 0' }}>Patient ID: {profile.mrNumber}</p>
          </div>
        </div>

        <table className="info-table">
          <tbody>
            <tr>
              <td><strong>Gender</strong></td>
              <td style={{ textTransform: 'capitalize' }}>{profile.gender}</td>
            </tr>
            <tr>
              <td><strong>Age</strong></td>
              <td>{profile.age || '—'}</td>
            </tr>
            <tr>
              <td><strong>Contact Number</strong></td>
              <td>{profile.contactNumber}</td>
            </tr>
            <tr>
              <td><strong>WhatsApp</strong></td>
              <td>{profile.whatsappNumber || 'Same as contact'}</td>
            </tr>
            <tr>
              <td><strong>Address</strong></td>
              <td>{profile.address || '—'}</td>
            </tr>
            <tr>
              <td><strong>Registered On</strong></td>
              <td>{new Date(profile.createdAt).toLocaleDateString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}