import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    // Fetch Patient Data
    api.get(`/patients/${id}`)
      .then(r => setPatient(r.data))
      .catch(e => setErr(e.response?.data?.message || 'Failed to load patient'));

    // Fetch All Lab Orders (Tests)
    api.get(`/orders?patient=${id}`)
      .then(r => setOrders(r.data))
      .catch(() => {});

    // Fetch All Invoices
    api.get(`/invoices?patient=${id}`)
      .then(r => setInvoices(r.data))
      .catch(() => {});
  }, [id]);

  if (err) return <p className="error">{err}</p>;
  if (!patient) return <p>Loading patient profile...</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Patient Profile: {patient.fullName}</h1>
        <Link to="/visits/new" className="btn">+ Create New Visit</Link>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
        
        {/* LEFT COLUMN: Demographics */}
        <div>
          <div className="card">
            <h3>Patient Details</h3>
            <table className="info-table">
              <tbody>
                <tr><td><strong>MR Number</strong></td><td>{patient.mrNumber}</td></tr>
                <tr><td><strong>Name</strong></td><td>{patient.fullName}</td></tr>
                <tr><td><strong>Gender</strong></td><td style={{ textTransform: 'capitalize' }}>{patient.gender}</td></tr>
                <tr><td><strong>Age</strong></td><td>{patient.age || '—'}</td></tr>
                <tr><td><strong>Contact</strong></td><td>{patient.contactNumber}</td></tr>
                <tr><td><strong>WhatsApp</strong></td><td>{patient.whatsappNumber || 'Same'}</td></tr>
                <tr><td><strong>Address</strong></td><td>{patient.address || '—'}</td></tr>
                <tr><td><strong>Registered</strong></td><td>{new Date(patient.createdAt).toLocaleDateString()}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: Medical & Financial History */}
        <div>
          {/* Lab Tests & Results */}
          <div className="card">
            <h3>Lab Test History ({orders.length})</h3>
            {orders.length === 0 && <p className="muted">No tests ordered yet.</p>}
            <table>
              <thead>
                <tr><th>Date</th><th>Test</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id}>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td><strong>{o.test?.testName || o.testNameSnapshot}</strong></td>
                    <td>
                      <span className={`badge badge-${o.status === 'approved' ? 'paid' : 'unpaid'}`}>
                        {o.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <Link to={`/results/${o._id}`}>View / Enter Result</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial History */}
          <div className="card">
            <h3>Billing History ({invoices.length})</h3>
            {invoices.length === 0 && <p className="muted">No invoices generated yet.</p>}
            <table>
              <thead>
                <tr><th>Invoice #</th><th>Date</th><th>Total</th><th>Balance</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv._id}>
                    <td>{inv.invoiceNumber}</td>
                    <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td>PKR {inv.total}</td>
                    <td style={{ color: inv.balance > 0 ? '#dc2626' : '#16a34a', fontWeight: 'bold' }}>
                      PKR {inv.balance}
                    </td>
                    <td><span className={`badge badge-${inv.status === 'paid' ? 'paid' : 'unpaid'}`}>{inv.status}</span></td>
                    <td>
                      <Link to={`/invoices/${inv._id}`}>Manage Billing</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}