import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/invoices').then(r => setInvoices(r.data))
      .catch(e => setErr(e.response?.data?.message || 'Failed'));
  }, []);

  return (
    <div>
      <h1>Invoices</h1>
      {err && <p className="error">{err}</p>}
      <table>
        <thead><tr>
          <th>Invoice #</th><th>Patient</th><th>Total</th>
          <th>Paid</th><th>Balance</th><th>Status</th><th></th>
        </tr></thead>
        <tbody>
          {invoices.map(i => (
            <tr key={i._id}>
              <td>{i.invoiceNumber}</td>
              <td>{i.patient?.fullName}</td>
              <td>{i.total}</td>
              <td>{i.paid}</td>
              <td>{i.balance}</td>
              <td>{i.status}</td>
              <td><Link to={`/invoices/${i._id}`}>Open</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}