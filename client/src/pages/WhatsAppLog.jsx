import { useEffect, useState } from 'react';
import api from '../api/axios.js';

export default function WhatsAppLog() {
  const [messages, setMessages] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/whatsapp/messages')
      .then(r => setMessages(r.data || []))
      .catch(e => setErr(e.response?.data?.message || 'Failed'));
  }, []);

  const badgeClass = (s) => {
    if (s === 'delivered' || s === 'read') return 'badge-paid';
    if (s === 'failed') return 'badge-unpaid';
    return 'badge-partially_paid';
  };

  return (
    <div>
      <h1>WhatsApp Messages</h1>
      {err && <p className="error">{err}</p>}
      {messages.length === 0 && !err && (
        <p>No WhatsApp messages sent yet. Approve a result and click "Send via WhatsApp".</p>
      )}

      {messages.length > 0 && (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Date</th><th>Patient</th><th>Phone</th>
                <th>Status</th><th>Error</th>
              </tr>
            </thead>
            <tbody>
              {messages.map(m => (
                <tr key={m._id}>
                  <td>{new Date(m.createdAt).toLocaleString()}</td>
                  <td>{m.patient?.mrNumber} — {m.patient?.fullName}</td>
                  <td>{m.phone || '—'}</td>
                  <td><span className={`badge ${badgeClass(m.status)}`}>{m.status}</span></td>
                  <td className="error small">{m.error || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}