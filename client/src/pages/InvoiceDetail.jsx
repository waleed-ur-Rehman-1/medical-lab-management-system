import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function InvoiceDetail() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [pay, setPay] = useState({ amount: '', method: 'cash' });
  const [discount, setDiscount] = useState('');
  const [err, setErr] = useState('');

  async function load() {
    try {
      const r = await api.get(`/invoices/${id}`);
      setInvoice(r.data.invoice);
      setPayments(r.data.payments);
    } catch (e) { setErr(e.response?.data?.message || 'Failed'); }
  }
  useEffect(() => { load(); }, [id]);

  async function applyDiscount() {
    setErr('');
    try {
      await api.post(`/invoices/${id}/discount`, { discount: Number(discount) });
      setDiscount('');
      load();
    } catch (e) { setErr(e.response?.data?.message || 'Failed'); }
  }

  async function recordPayment(e) {
    e.preventDefault();
    setErr('');
    try {
      await api.post(`/invoices/${id}/payments`, {
        amount: Number(pay.amount), method: pay.method
      });
      setPay({ amount: '', method: 'cash' });
      load();
    } catch (e) { setErr(e.response?.data?.message || 'Failed'); }
  }

  if (!invoice) return <p>Loading…</p>;

  return (
    <div>
      <div className="page-header">
        <h1>Invoice {invoice.invoiceNumber}</h1>
        <Link to={`/print/invoice/${invoice._id}`} target="_blank" rel="noopener" className="btn">
          🖨️ Print Bill
        </Link>
      </div>
      {err && <p className="error">{err}</p>}
      <p>Patient: {invoice.patient?.fullName} ({invoice.patient?.mrNumber})</p>

      <div className="card">
        <table>
          <thead><tr><th>Item</th><th>Price</th></tr></thead>
          <tbody>
            {invoice.items.map((it, i) =>
              <tr key={i}><td>{it.name}</td><td>{it.price}</td></tr>
            )}
          </tbody>
        </table>
        <p>Subtotal: {invoice.subtotal}</p>
        <p>Discount: {invoice.discount}</p>
        <p>Total: <strong>{invoice.total}</strong></p>
        <p>Paid: {invoice.paid}</p>
        <p>Balance: <strong>{invoice.balance}</strong> ({invoice.status})</p>
      </div>

      <div className="card">
        <h3>Apply Discount</h3>
        <div className="row">
          <input type="number" value={discount}
            onChange={e => setDiscount(e.target.value)} placeholder="Amount" />
          <button onClick={applyDiscount}>Apply</button>
        </div>
      </div>

      <div className="card">
        <h3>Record Payment</h3>
        <form onSubmit={recordPayment} className="row">
          <input type="number" value={pay.amount}
            onChange={e => setPay({ ...pay, amount: e.target.value })}
            placeholder="Amount" required />
          <select value={pay.method}
            onChange={e => setPay({ ...pay, method: e.target.value })}>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank">Bank</option>
            <option value="other">Other</option>
          </select>
          <button type="submit">Pay</button>
        </form>
        <h4>Payment History</h4>
        <ul>
          {payments.map(p =>
            <li key={p._id}>
              {new Date(p.createdAt).toLocaleString()} — {p.amount} ({p.method})
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}