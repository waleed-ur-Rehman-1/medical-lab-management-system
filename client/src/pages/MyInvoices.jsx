import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function MyInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    Promise.allSettled([
      api.get('/invoices/me'),
      api.get('/invoices/me/payments')
    ]).then(([i, p]) => {
      setInvoices(i.status === 'fulfilled' ? i.value.data : []);
      setPayments(p.status === 'fulfilled' ? p.value.data : []);
    }).catch(() => setErr('Failed to load'));
  }, []);

  return (
    <div>
      <h1>My Invoices</h1>
      {err && <p className="error">{err}</p>}

      <div className="card">
        <h2>Invoices</h2>
        {invoices.length === 0 && <p>No invoices yet.</p>}
        <table>
          <thead><tr>
            <th>Invoice #</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th></th>
          </tr></thead>
          <tbody>
            {invoices.map(i => (
              <tr key={i._id}>
                <td>{i.invoiceNumber}</td>
                <td>{i.total}</td>
                <td>{i.paid}</td>
                <td>{i.balance}</td>
                <td>{i.status}</td>
                <td>
                  <Link to={`/print/invoice/${i._id}`} target="_blank" rel="noopener">
                    🖨️ Print
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Payment History</h2>
        {payments.length === 0 && <p>No payments yet.</p>}
        <ul>
          {payments.map(p => (
            <li key={p._id}>
              {new Date(p.createdAt).toLocaleString()} — {p.amount} ({p.method}) · {p.invoice?.invoiceNumber}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}