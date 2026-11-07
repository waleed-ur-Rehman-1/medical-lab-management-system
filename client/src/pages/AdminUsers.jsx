import { useEffect, useState } from 'react';
import api from '../api/axios.js';

const ROLES = ['admin','receptionist','technician','patient','doctor','accountant'];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'receptionist' });
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    try {
      const r = await api.get('/admin/users');
      setUsers(r.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to load users');
    }
  }
  useEffect(() => { load(); }, []);

  async function createUser(e) {
    e.preventDefault();
    setErr(''); setMsg('');
    try {
      await api.post('/admin/users', form);
      setMsg(`✅ User ${form.email} created`);
      setForm({ name: '', email: '', password: '', role: 'receptionist' });
      load();
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to create user');
    }
  }

  async function toggleActive(u) {
    try {
      await api.patch(`/admin/users/${u._id}`, { isActive: !u.isActive });
      load();
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to update');
    }
  }

  async function changeRole(u, role) {
    try {
      await api.patch(`/admin/users/${u._id}`, { role });
      load();
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to update role');
    }
  }

  return (
    <div>
      <h1>User Management</h1>
      {err && <p className="error">{err}</p>}
      {msg && <p className="ok">{msg}</p>}

      <form onSubmit={createUser} className="card">
        <h3>Create User</h3>
        <div className="row">
          <label>Name
            <input value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>Email
            <input type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label>Password
            <input type="password" minLength={6} value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </label>
          <label>Role
            <select value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </label>
          <button type="submit">Create</button>
        </div>
      </form>

      <div className="card">
        <h3>All Users ({users.length})</h3>
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Active</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <select value={u.role} onChange={e => changeRole(u, e.target.value)}>
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </td>
                <td>{u.isActive ? '✅' : '❌'}</td>
                <td>
                  <button onClick={() => toggleActive(u)}>
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}