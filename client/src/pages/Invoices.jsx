import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Invoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [err, setErr] = useState('');

  async function loadInvoices() {
    try {
      const r = await api.get('/invoices');
      setInvoices(r.data);
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to load invoices');
    }
  }

  useEffect(() => { loadInvoices(); }, []);

  async function handleDelete(id, invoiceNumber) {
    if (!window.confirm(`Are you sure you want to permanently delete invoice ${invoiceNumber}? This cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/invoices/${id}`);
      loadInvoices(); // Refresh the list
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete invoice');
    }
  }

  return (
    <div>
      <h1>Invoices</h1>
      {err && <p className="error">{err}</p>}
      
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Invoice #</th><th>Patient</th><th>Total</th>
              <th>Paid</th><th>Balance</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(i => (
              <tr key={i._id}>
                <td>{i.invoiceNumber}</td>
                <td>{i.patient?.fullName}</td>
                <td>PKR {i.total}</td>
                <td>PKR {i.paid}</td>
                <td style={{ color: i.balance > 0 ? '#dc2626' : '#16a34a', fontWeight: 'bold' }}>
                  PKR {i.balance}
                </td>
                <td>
                  <span className={`badge badge-${i.status === 'paid' ? 'paid' : 'unpaid'}`}>
                    {i.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Link to={`/invoices/${i._id}`}>Open</Link>
                    
                    {/* Delete Button (Admin Only) */}
                    {user.role === 'admin' && (
                      <button 
                        onClick={() => handleDelete(i._id, i.invoiceNumber)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 0 }}
                        title="Delete Invoice"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center' }}>No invoices found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}