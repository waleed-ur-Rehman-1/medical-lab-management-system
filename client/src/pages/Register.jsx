import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'admin'
  });
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      await register(form);
      nav('/');
    } catch (e) {
      setErr(e.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <div className="auth">
      <form onSubmit={submit} className="card">
        <h1>Create Account</h1>
        <label>Name
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        </label>
        <label>Email
          <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        </label>
        <label>Password
          <input type="password" minLength={6} value={form.password}
            onChange={e => setForm({...form, password: e.target.value})} required />
        </label>
        <label>Role
          <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            <option value="admin">Admin</option>
            <option value="receptionist">Receptionist</option>
            <option value="technician">Lab Technician</option>
            <option value="accountant">Accountant</option>
            <option value="doctor">Doctor</option>
            <option value="patient">Patient</option>
          </select>
        </label>
        {err && <p className="error">{err}</p>}
        <button type="submit">Register</button>
      </form>
    </div>
  );
}