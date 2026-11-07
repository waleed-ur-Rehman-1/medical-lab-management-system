import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

const empty = { fullName: '', gender: 'male', contactNumber: '', age: '', address: '' };

export default function Patients() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState('');

  async function load(query = '') {
    try {
      const r = await api.get('/patients', query ? { params: { q: query } } : {});
      setList(r.data);
    } catch (e) { setErr(e.response?.data?.message || 'Failed'); }
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    setErr('');
    try {
      await api.post('/patients', {
        ...form,
        age: form.age ? Number(form.age) : undefined
      });
      setForm(empty);
      load(q);
    } catch (e) { setErr(e.response?.data?.message || 'Failed to create'); }
  }

  return (
    <div>
      <h1>Patients</h1>
      {err && <p className="error">{err}</p>}

      <form onSubmit={create} className="card">
        <h2>Register Patient</h2>
        <div className="row">
          <label>Full Name
            <input value={form.fullName}
              onChange={e => setForm({...form, fullName: e.target.value})} required />
          </label>
          <label>Gender
            <select value={form.gender}
              onChange={e => setForm({...form, gender: e.target.value})}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>Contact
            <input value={form.contactNumber}
              onChange={e => setForm({...form, contactNumber: e.target.value})} required />
          </label>
          <label>Age
            <input type="number" value={form.age}
              onChange={e => setForm({...form, age: e.target.value})} />
          </label>
          <label>Address
            <input value={form.address}
              onChange={e => setForm({...form, address: e.target.value})} />
          </label>
        </div>
        <button type="submit">Save</button>
      </form>

      <div className="card">
        <div className="row">
          <input placeholder="Search name / MR / contact"
            value={q} onChange={e => setQ(e.target.value)} />
          <button onClick={() => load(q)}>Search</button>
        </div>
        <table>
          <thead>
            <tr><th>MR</th><th>Name</th><th>Gender</th><th>Contact</th><th></th></tr>
          </thead>
          <tbody>
            {list.map(p => (
              <tr key={p._id}>
                <td>{p.mrNumber}</td>
                <td>{p.fullName}</td>
                <td>{p.gender}</td>
                <td>{p.contactNumber}</td>
                <td><Link to={`/patients/${p._id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}