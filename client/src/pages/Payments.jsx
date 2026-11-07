import { useEffect, useState } from 'react';
import api from '../api/axios.js';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/payments')
      .then(r => setPayments(r.data))
      .catch(e => setErr(e.response?.data?.message || 'Failed'));
  }, []);

  return (
    <div>
      <h1>All Payments</h1>
      {err && <p className="error">{err}</p>}
      <table>
        <thead><tr>
          <th>Date</th><th>Invoice</th><th>Amount</th><th>Method</th><th>Received By</th>
        </tr></thead>
        <tbody>
          {payments.map(p => (
            <tr key={p._id}>
              <td>{new Date(p.createdAt).toLocaleString()}</td>
              <td>{p.invoice?.invoiceNumber}</td>
              <td>{p.amount}</td>
              <td>{p.method}</td>
              <td>{p.receivedBy?.name || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {payments.length === 0 && !err && <p>No payments recorded yet.</p>}
    </div>
  );
}