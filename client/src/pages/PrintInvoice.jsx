import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';
import LAB from '../config/lab.js';

export default function PrintInvoice() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get(`/invoices/${id}`)
      .then(r => setData(r.data))
      .catch(e => setErr(e.response?.data?.message || 'Failed'));
  }, [id]);

  if (err) return <div className="print-error">{err}</div>;
  if (!data) return <div className="print-error">Loading…</div>;

  const { invoice, payments } = data;
  const fmt = (n) => Number(n || 0).toFixed(2);

  return (
    <div className="print-page">
      <div className="print-toolbar no-print">
        <button onClick={() => window.print()}>🖨️ Print / Save as PDF</button>
        <Link to={`/invoices/${invoice._id}`}>← Back to Invoice</Link>
      </div>

      <div className="print-sheet">
        {/* ─── HEADER ─── */}
        <header className="sheet-header">
          <div className="lab-brand">
            <div className="lab-logo">🧪</div>
            <div>
              <h1>{LAB.name}</h1>
              <p className="muted">{LAB.tagline}</p>
            </div>
          </div>
          <div className="lab-contact">
            <p>{LAB.addressLine1}</p>
            <p>{LAB.addressLine2}</p>
            <p>📞 {LAB.phone} · 📱 {LAB.mobile}</p>
            <p>✉️ {LAB.email} · 🌐 {LAB.website}</p>
          </div>
        </header>

        <div className="sheet-divider" />

        <div className="sheet-title-row">
          <h2>INVOICE / RECEIPT</h2>
          <div className="invoice-meta">
            <p><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
            <p><strong>Date:</strong> {new Date(invoice.createdAt).toLocaleString()}</p>
            <p><strong>Status:</strong> <span className={`badge badge-${invoice.status}`}>{invoice.status.replace('_', ' ')}</span></p>
          </div>
        </div>

        {/* ─── PATIENT ─── */}
        <section className="sheet-section">
          <h3>Patient Information</h3>
          <div className="info-grid">
            <div><span className="k">MR Number</span><span className="v">{invoice.patient?.mrNumber}</span></div>
            <div><span className="k">Name</span><span className="v">{invoice.patient?.fullName}</span></div>
            <div><span className="k">Gender</span><span className="v">{invoice.patient?.gender}</span></div>
            <div><span className="k">Contact</span><span className="v">{invoice.patient?.contactNumber}</span></div>
          </div>
        </section>

        {/* ─── ITEMS ─── */}
        <section className="sheet-section">
          <h3>Services</h3>
          <table className="sheet-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Test / Service</th>
                <th style={{ width: 100, textAlign: 'right' }}>Price (PKR)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((it, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{it.name}</td>
                  <td style={{ textAlign: 'right' }}>{fmt(it.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ─── TOTALS ─── */}
        <section className="sheet-section totals">
          <table className="totals-table">
            <tbody>
              <tr><td>Subtotal</td><td style={{ textAlign: 'right' }}>PKR {fmt(invoice.subtotal)}</td></tr>
              <tr><td>Discount</td><td style={{ textAlign: 'right' }}>− PKR {fmt(invoice.discount)}</td></tr>
              <tr className="total-row"><td>Total</td><td style={{ textAlign: 'right' }}>PKR {fmt(invoice.total)}</td></tr>
              <tr><td>Paid</td><td style={{ textAlign: 'right' }}>PKR {fmt(invoice.paid)}</td></tr>
              <tr className={invoice.balance > 0 ? 'due-row' : ''}>
                <td>Balance Due</td>
                <td style={{ textAlign: 'right' }}>PKR {fmt(invoice.balance)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* ─── PAYMENT HISTORY ─── */}
        {payments.length > 0 && (
          <section className="sheet-section">
            <h3>Payment History</h3>
            <table className="sheet-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Method</th>
                  <th style={{ width: 120, textAlign: 'right' }}>Amount (PKR)</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p._id}>
                    <td>{new Date(p.createdAt).toLocaleString()}</td>
                    <td style={{ textTransform: 'capitalize' }}>{p.method}</td>
                    <td style={{ textAlign: 'right' }}>{fmt(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* ─── FOOTER ─── */}
        <footer className="sheet-footer">
          <p>{LAB.footerNote}</p>
          <div className="signature-row">
            <div className="sig-box">
              <span className="sig-line" />
              <span className="sig-label">Received By / Signature</span>
            </div>
            <div className="sig-box">
              <span className="sig-line" />
              <span className="sig-label">Authorized Signature</span>
            </div>
          </div>
          <p className="muted small">{LAB.name} · {LAB.regNumber} · {LAB.phone}</p>
        </footer>
      </div>
    </div>
  );
}