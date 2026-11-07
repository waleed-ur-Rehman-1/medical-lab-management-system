import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';

export default function NewVisit() {
  const nav = useNavigate();
  const [patients, setPatients] = useState([]);
  const [tests, setTests] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [selected, setSelected] = useState([]);
  const [refDoc, setRefDoc] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/patients').then(r => setPatients(r.data)).catch(() => {});
    api.get('/tests').then(r => setTests(r.data)).catch(() => {});
  }, []);

  const toggle = (id) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      const r = await api.post('/visits', {
        patientId, testIds: selected, referringDoctorName: refDoc
      });
      nav(`/invoices/${r.data.invoice._id}`);
    } catch (e) { setErr(e.response?.data?.message || 'Failed'); }
  }

  return (
    <div>
      <h1>New Visit</h1>
      {err && <p className="error">{err}</p>}
      <form onSubmit={submit} className="card">
        <label>Patient
          <select value={patientId} onChange={e => setPatientId(e.target.value)} required>
            <option value="">Select patient</option>
            {patients.map(p =>
              <option key={p._id} value={p._id}>{p.mrNumber} — {p.fullName}</option>
            )}
          </select>
        </label>
        <label>Referring Doctor
          <input value={refDoc} onChange={e => setRefDoc(e.target.value)} />
        </label>
        <h3>Tests</h3>
        <div className="test-list">
          {tests.filter(t => t.isActive).map(t => (
            <label key={t._id} className="test-item">
              <input type="checkbox"
                checked={selected.includes(t._id)}
                onChange={() => toggle(t._id)} />
              {t.testName} — {t.price}
            </label>
          ))}
        </div>
        <button type="submit" disabled={!patientId || selected.length === 0}>
          Create Visit & Invoice
        </button>
      </form>
    </div>
  );
}