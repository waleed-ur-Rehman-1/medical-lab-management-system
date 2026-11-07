import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import useSocket from '../hooks/useSocket.js';

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [toasts, setToasts] = useState([]);

  const pushToast = (msg) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
  };

  useSocket({
    'result:approved': (d) => {
      if (user.role === 'patient') pushToast(`✅ ${d.message}`);
    },
    'result:status': (d) => {
      if (['admin', 'technician'].includes(user.role))
        pushToast(`📋 Result ${d.status}`);
    },
    'payment:recorded': (d) => {
      if (['admin', 'accountant', 'receptionist'].includes(user.role))
        pushToast(`💰 Payment ${d.amount} on ${d.invoiceNumber}`);
    },
    'invoice:updated': (d) => {
      if (user.role === 'patient')
        pushToast(`🧾 Invoice updated — balance ${d.balance}`);
    }
  });

  const staffLinks = [
    { to: '/',                label: 'Dashboard',    roles: ['admin','receptionist','technician','accountant'] },
    { to: '/patients',        label: 'Patients',     roles: ['admin','receptionist','technician','accountant'] },
    { to: '/visits/new',      label: 'New Visit',    roles: ['admin','receptionist'] },
    { to: '/tests',           label: 'Tests',        roles: ['admin','receptionist','technician'] },
    { to: '/orders',          label: 'Orders',       roles: ['admin','receptionist','technician'] },
    { to: '/invoices',        label: 'Invoices',     roles: ['admin','receptionist','accountant'] },
    { to: '/payments',        label: 'Payments',     roles: ['admin','receptionist','accountant'] },
    { to: '/finance',         label: 'Finance',      roles: ['admin','accountant'] },
    { to: '/admin/users',     label: 'Users',        roles: ['admin'] },
    { to: '/admin/audit',     label: 'Audit Logs',   roles: ['admin'] },
    { to: '/admin/whatsapp',  label: 'WhatsApp Log', roles: ['admin'] }
  ];

  const patientLinks = [
    { to: '/',              label: 'Dashboard',   roles: ['patient'] },
    { to: '/my/results',    label: 'My Results',  roles: ['patient'] },
    { to: '/my/invoices',   label: 'My Invoices', roles: ['patient'] }
  ];

  const doctorLinks = [
    { to: '/',                 label: 'Dashboard',   roles: ['doctor'] },
    { to: '/doctor/patients',  label: 'My Patients', roles: ['doctor'] }
  ];

  const links =
    user.role === 'patient' ? patientLinks :
    user.role === 'doctor'  ? doctorLinks  :
    staffLinks;

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>MLMIS</h2>
        <nav>
          {links
            .filter((l) => l.roles.includes(user.role))
            .map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'}>
                {l.label}
              </NavLink>
            ))}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <span>{user.name} — {user.role}</span>
          <button onClick={() => { logout(); nav('/login'); }}>Logout</button>
        </header>
        <div className="content"><Outlet /></div>
      </main>

      {/* Real-time toast stack */}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className="toast">{t.msg}</div>
        ))}
      </div>
    </div>
  );
}