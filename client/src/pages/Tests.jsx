import { useEffect, useState, Fragment } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

const emptyParam = { name: '', unit: '', resultType: 'numeric', referenceRange: '', low: '', high: '' };
const emptyTest = {
  testCode: '', testName: '', category: 'Hematology',
  price: '', sampleType: 'Blood', parameters: [{ ...emptyParam }]
};

export default function Tests() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [form, setForm] = useState(emptyTest);
  const [err, setErr] = useState('');
  const [expandedTest, setExpandedTest] = useState(null);

  async function load() {
    try { setTests((await api.get('/tests')).data); }
    catch (e) { setErr(e.response?.data?.message || 'Failed to load tests'); }
  }
  useEffect(() => { load(); }, []);

  const setParam = (i, patch) =>
    setForm(f => ({ ...f, parameters: f.parameters.map((p, idx) => idx === i ? { ...p, ...patch } : p) }));

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      await api.post('/tests', {
        ...form,
        price: Number(form.price),
        parameters: form.parameters.map(p => ({
          name: p.name,
          unit: p.unit,
          resultType: p.resultType,
          referenceRange: p.referenceRange,
          low: p.low === '' ? undefined : Number(p.low),
          high: p.high === '' ? undefined : Number(p.high)
        }))
      });
      setForm(emptyTest);
      load();
    } catch (e) { setErr(e.response?.data?.message || 'Failed to create test'); }
  }

  async function deleteTest(id, name) {
    if (!window.confirm(`Delete the entire test: "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/tests/${id}`);
      load();
    } catch (e) { alert(e.response?.data?.message || 'Failed to delete test'); }
  }

  async function deleteParam(testId, paramId, paramName) {
    if (!window.confirm(`Remove parameter "${paramName}" from this test?`)) return;
    try {
      await api.delete(`/tests/${testId}/parameters/${paramId}`);
      load();
    } catch (e) { alert(e.response?.data?.message || 'Failed to delete parameter'); }
  }

  return (
    <div>
      <h1>Test Catalog</h1>
      {err && <p className="error">{err}</p>}

      {user.role === 'admin' && (
        <form onSubmit={submit} className="card">
          <h2>Create Test</h2>
          <div className="row">
            <label>Code <input value={form.testCode} onChange={e => setForm({...form, testCode: e.target.value})} required /></label>
            <label>Name <input value={form.testName} onChange={e => setForm({...form, testName: e.target.value})} required /></label>
            <label>Category <input value={form.category} onChange={e => setForm({...form, category: e.target.value})} required /></label>
            <label>Price <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required /></label>
            <label>Sample Type <input value={form.sampleType} onChange={e => setForm({...form, sampleType: e.target.value})} /></label>
          </div>
          
          <h3>Parameters</h3>
          {form.parameters.map((p, i) => (
            <div key={i} className="row" style={{ background: '#f9fafb', padding: 10, borderRadius: 6, marginBottom: 8, alignItems: 'flex-end' }}>
              <label>Name <input value={p.name} onChange={e => setParam(i, { name: e.target.value })} required /></label>
              <label>Unit <input value={p.unit} onChange={e => setParam(i, { unit: e.target.value })} /></label>
              <label>Type 
                <select value={p.resultType} onChange={e => setParam(i, { resultType: e.target.value })}>
                  <option value="numeric">Numeric</option>
                  <option value="qualitative">Qualitative</option>
                </select>
              </label>
              <label>Reference <input value={p.referenceRange} onChange={e => setParam(i, { referenceRange: e.target.value })} /></label>
              <label>Low <input type="number" value={p.low} onChange={e => setParam(i, { low: e.target.value })} /></label>
              <label>High <input type="number" value={p.high} onChange={e => setParam(i, { high: e.target.value })} /></label>
              <button type="button" onClick={() => setForm(f => ({...f, parameters: f.parameters.filter((_, idx) => idx !== i)}))} style={{ background: '#dc2626', height: 38 }}>X</button>
            </div>
          ))}
          <div className="row" style={{ marginTop: 12 }}>
            <button type="button" onClick={() => setForm(f => ({ ...f, parameters: [...f.parameters, { ...emptyParam }] }))} style={{ background: '#4b5563' }}>+ Add Parameter</button>
            <button type="submit">Save Test</button>
          </div>
        </form>
      )}

      <div className="card">
        <h2>Existing Tests ({tests.length})</h2>
        <table>
          <thead><tr><th>Code</th><th>Name</th><th>Category</th><th>Price</th><th>Details</th><th>Actions</th></tr></thead>
          <tbody>
            {tests.map(t => (
              <Fragment key={t._id}>
                <tr>
                  <td>{t.testCode}</td>
                  <td>{t.testName}</td>
                  <td>{t.category}</td>
                  <td>PKR {t.price}</td>
                  <td>
                    <button onClick={() => setExpandedTest(expandedTest === t._id ? null : t._id)} style={{ background: 'none', color: '#2563eb', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 'bold' }}>
                      {t.parameters.length} parameters {expandedTest === t._id ? '▲' : '▼'}
                    </button>
                  </td>
                  <td>
                    {user.role === 'admin' && (
                      <button onClick={() => deleteTest(t._id, t.testName)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}>🗑️ Delete Test</button>
                    )}
                  </td>
                </tr>
                
                {/* Expanded Row showing parameters */}
                {expandedTest === t._id && (
                  <tr>
                    <td colSpan="6" style={{ padding: 0, border: 'none' }}>
                      <div style={{ padding: '12px 20px', background: '#f3f4f6', borderRadius: '0 0 8px 8px' }}>
                        <h4 style={{ margin: '0 0 10px 0' }}>Parameters for {t.testName}</h4>
                        <table style={{ background: 'transparent', boxShadow: 'none' }}>
                          <thead><tr><th>Name</th><th>Unit</th><th>Reference Range</th><th>Actions</th></tr></thead>
                          <tbody>
                            {t.parameters.map(p => (
                              <tr key={p._id}>
                                <td>{p.name}</td>
                                <td>{p.unit || '—'}</td>
                                <td>{p.referenceRange || '—'}</td>
                                <td>
                                  {user.role === 'admin' && (
                                    <button onClick={() => deleteParam(t._id, p._id, p.name)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 16 }}>🗑️</button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}