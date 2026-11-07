import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function ResultEntry() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      const o = (await api.get(`/orders/${orderId}`)).data;
      setOrder(o);
      try {
        const r = (await api.get(`/results/order/${orderId}`)).data;
        if (r) {
          setResult(r);
          const v = {};
          r.values.forEach((val) => { v[val.parameterId] = val.value; });
          setValues(v);
        } else {
          setResult(null);
        }
      } catch { /* no result yet */ }
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to load order');
    }
  }

  useEffect(() => { refresh(); }, [orderId]);

  async function save() {
    setErr(''); setMsg(''); setBusy(true);
    try {
      const payload = {
        values: Object.entries(values).map(([parameterId, value]) => ({ parameterId, value }))
      };
      const r = (await api.post(`/results/order/${orderId}`, payload)).data;
      setResult(r);
      setMsg('Draft saved');
      return r;
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to save');
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    const saved = await save();
    if (!saved) return;
    setBusy(true);
    try {
      const r = (await api.post(`/results/${saved._id}/submit`)).data;
      setResult(r);
      setMsg('Submitted for verification');
      await refresh();
    } catch (e) { setErr(e.response?.data?.message || 'Failed'); }
    finally { setBusy(false); }
  }

  async function approve() {
    if (!result) return setErr('Save a draft first');
    if (result.status === 'approved') return;
    setBusy(true);
    try {
      const r = (await api.post(`/results/${result._id}/approve`)).data;
      setResult(r);
      setMsg('Approved');
      await refresh();
    } catch (e) { setErr(e.response?.data?.message || 'Failed'); }
    finally { setBusy(false); }
  }

  async function reject() {
    if (!result) return setErr('Save a draft first');
    if (result.status === 'approved') return setErr('Approved results cannot be rejected');
    const reason = prompt('Rejection reason');
    if (!reason) return;
    setBusy(true);
    try {
      const r = (await api.post(`/results/${result._id}/reject`, { reason })).data;
      setResult(r);
      setMsg('Rejected');
      await refresh();
    } catch (e) { setErr(e.response?.data?.message || 'Failed'); }
    finally { setBusy(false); }
  }

  async function sendWhatsApp() {
    if (!result) return;
    if (!confirm('Send this approved report to the patient via WhatsApp?')) return;
    setBusy(true); setErr(''); setMsg('');
    try {
      const r = await api.post(`/whatsapp/send-report/${result._id}`);
      const status = r.data.record?.status || 'sent';
      const mock = r.data.mock ? ' (mock)' : '';
      setMsg(`✅ WhatsApp sent${mock} — status: ${status}`);
    } catch (e) {
      const m = e.response?.data?.message || 'WhatsApp send failed';
      const detail = e.response?.data?.error ? ` — ${e.response.data.error}` : '';
      setErr(m + detail);
    } finally {
      setBusy(false);
    }
  }

  if (err && !order) return <p className="error">{err}</p>;
  if (!order) return <p>Loading…</p>;

  const params = order.test?.parameters || [];
  const testName = order.test?.testName || order.testNameSnapshot || 'Test';
  const status = result?.status || 'not_started';
  const isApproved = status === 'approved';
  const isEditable = !isApproved;

  return (
    <div>
      <div className="page-header">
        <h1>Result Entry</h1>
        {isApproved && result && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Link
              to={`/print/result/${result._id}`}
              target="_blank"
              rel="noopener"
              className="btn"
            >
              🖨️ Print Report
            </Link>
            <button onClick={sendWhatsApp} disabled={busy} className="btn-wa">
              📱 Send via WhatsApp
            </button>
          </div>
        )}
      </div>

      <p>
        <strong>Order:</strong> {order.orderNumber}
        {' · '}
        <strong>Patient:</strong> {order.patient?.fullName} ({order.patient?.mrNumber})
        {' · '}
        <strong>Test:</strong> {testName}
      </p>

      {err && <p className="error">{err}</p>}
      {msg && <p className="ok">{msg}</p>}

      {result?.status === 'rejected' && result.rejectionReason && (
        <div className="card" style={{ borderColor: '#dc2626', background: '#fef2f2' }}>
          <strong>Rejected:</strong> {result.rejectionReason}
        </div>
      )}

      {result && (
        <div className="card" style={{ padding: '8px 16px' }}>
          <p style={{ margin: 0 }}>
            <strong>Status:</strong>{' '}
            <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>
              {result.status.replace('_', ' ')}
            </span>
            {' · '}
            <strong>Revision:</strong> v{result.revision}
            {result.verifiedAt && (
              <> {' · '} <strong>Verified:</strong> {new Date(result.verifiedAt).toLocaleString()}</>
            )}
          </p>
        </div>
      )}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Parameter</th>
              <th style={{ width: 140 }}>Value</th>
              <th style={{ width: 100 }}>Unit</th>
              <th style={{ width: 160 }}>Reference</th>
            </tr>
          </thead>
          <tbody>
            {params.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>
                  <input
                    value={values[p._id] || ''}
                    readOnly={!isEditable}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [p._id]: e.target.value }))
                    }
                  />
                </td>
                <td>{p.unit}</td>
                <td>{p.referenceRange}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="row" style={{ marginTop: 12 }}>
          {isEditable && (
            <>
              <button onClick={save} disabled={busy}>Save Draft</button>
              <button onClick={submit} disabled={busy || status === 'pending_verification'}>
                Submit for Verification
              </button>
            </>
          )}
          {status === 'pending_verification' && (
            <>
              <button onClick={approve} disabled={busy}>Approve</button>
              <button onClick={reject} disabled={busy} className="danger">Reject</button>
            </>
          )}
          {isApproved && result && (
            <>
              <Link
                to={`/print/result/${result._id}`}
                target="_blank"
                rel="noopener"
                className="btn"
              >
                🖨️ Print Report
              </Link>
              <button onClick={sendWhatsApp} disabled={busy} className="btn-wa">
                📱 Send via WhatsApp
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}