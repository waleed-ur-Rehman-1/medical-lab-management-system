import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';
import LAB from '../config/lab.js';

export default function PrintResult() {
  const { id } = useParams();
  const [r, setR] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get(`/results/${id}`)
      .then(res => setR(res.data))
      .catch(e => setErr(e.response?.data?.message || 'Failed'));
  }, [id]);

  if (err) return <div className="print-error">{err}</div>;
  if (!r) return <div className="print-error">Loading…</div>;

  if (r.status !== 'approved') {
    return (
      <div className="print-error">
        <p>This result is <strong>{r.status}</strong> — only approved results can be printed.</p>
        <Link to="/">← Back</Link>
      </div>
    );
  }

  return (
    <div className="print-page">
      <div className="print-toolbar no-print">
        <button onClick={() => window.print()}>🖨️ Print / Save as PDF</button>
        <Link to="/my/results">← Back</Link>
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
          <h2>LABORATORY REPORT</h2>
          <div className="invoice-meta">
            <p><strong>Report #:</strong> RPT-{r._id.slice(-6).toUpperCase()}</p>
            <p><strong>Order #:</strong> {r.order?.orderNumber}</p>
            <p><strong>Date:</strong> {new Date(r.verifiedAt || r.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* ─── PATIENT ─── */}
        <section className="sheet-section">
          <h3>Patient Information</h3>
          <div className="info-grid">
            <div><span className="k">MR Number</span><span className="v">{r.patient?.mrNumber}</span></div>
            <div><span className="k">Full Name</span><span className="v">{r.patient?.fullName}</span></div>
            <div><span className="k">Gender</span><span className="v">{r.patient?.gender}</span></div>
            <div><span className="k">Age</span><span className="v">{r.patient?.age ?? '—'}</span></div>
            <div><span className="k">Contact</span><span className="v">{r.patient?.contactNumber}</span></div>
            <div><span className="k">Sample Type</span><span className="v">{r.order?.sampleType || 'Blood'}</span></div>
          </div>
        </section>

        {/* ─── TEST ─── */}
        <section className="sheet-section">
          <h3>Test: {r.test?.testName} <span className="muted">({r.test?.testCode})</span></h3>
          <table className="sheet-table result-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th style={{ width: 90, textAlign: 'center' }}>Result</th>
                <th style={{ width: 80, textAlign: 'center' }}>Unit</th>
                <th style={{ width: 160, textAlign: 'center' }}>Reference Range</th>
                <th style={{ width: 70, textAlign: 'center' }}>Flag</th>
              </tr>
            </thead>
            <tbody>
              {r.values.map((v, i) => (
                <tr key={i}>
                  <td>{v.parameterName}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{v.value || '—'}</td>
                  <td style={{ textAlign: 'center' }}>{v.unit || ''}</td>
                  <td style={{ textAlign: 'center' }}>{v.referenceRange || ''}</td>
                  <td style={{ textAlign: 'center' }}>
                    {v.flag === 'low' && <span className="flag flag-low">L</span>}
                    {v.flag === 'high' && <span className="flag flag-high">H</span>}
                    {v.flag === 'abnormal' && <span className="flag flag-high">A</span>}
                    {(v.flag === 'normal' || !v.flag) && <span className="flag flag-normal">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted small mt-8">
            <strong>Legend:</strong> L = Below reference range · H = Above reference range · A = Abnormal · — = Within range
          </p>
        </section>

        {/* ─── VERIFICATION ─── */}
        <section className="sheet-section">
          <h3>Verification</h3>
          <div className="info-grid">
            <div><span className="k">Entered By</span><span className="v">{r.enteredBy?.name || '—'}</span></div>
            <div><span className="k">Verified By</span><span className="v">{r.verifiedBy?.name || '—'}</span></div>
            <div><span className="k">Verified At</span><span className="v">{r.verifiedAt ? new Date(r.verifiedAt).toLocaleString() : '—'}</span></div>
            <div><span className="k">Revision</span><span className="v">v{r.revision}</span></div>
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="sheet-footer">
          <div className="signature-row">
            <div className="sig-box">
              <span className="sig-line" />
              <span className="sig-label">{r.verifiedBy?.name || 'Authorized Verifier'}</span>
              <span className="sig-sub">Verified By</span>
            </div>
            <div className="sig-box">
              <span className="sig-line" />
              <span className="sig-label">Laboratory Stamp</span>
            </div>
          </div>
          <p className="disclaimer">{LAB.disclaimer}</p>
          <p className="muted small">{LAB.name} · {LAB.regNumber} · {LAB.phone}</p>
        </footer>
      </div>
    </div>
  );
}