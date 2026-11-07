import { useEffect, useState } from 'react';
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

  async function load() {
    try { setTests((await api.get('/tests')).data); }
    catch (e) { setErr(e.response?.data?.message || 'Failed'); }
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
    } catch (e) { setErr(e.response?.data?.message || 'Failed'); }
  }

  return (
    <div>
      <h1>Test Catalog</h1>
      {err && <p className="error">{err}</p>}

      {user.role === 'admin' && (
        <form onSubmit={submit} className="card">
          <h2>Create Test</h2>
          <div className="row">
            <label>Code
              <input value={form.testCode}
                onChange={e => setForm({...form, testCode: e.target.value})} required />
            </label>
            <label>Name
              <input value={form.testName}
                onChange={e => setForm({...form, testName: e.target.value})} required />
            </label>
            <label>Category
              <input value={form.category}
                onChange={e => setForm({...form, category: e.target.value})} required />
            </label>
            <label>Price
              <input type="number" value={form.price}
                onChange={e => setForm({...form, price: e.target.value})} required />
            </label>
            <label>Sample Type
              <input value={form.sampleType}
                onChange={e => setForm({...form, sampleType: e.target.value})} />
            </label>
          </div>
          <h3>Parameters</h3>
          {form.parameters.map((p, i) => (
            <div key={i} className="row">
              <label>Name
                <input value={p.name}
                  onChange={e => setParam(i, { name: e.target.value })} required />
              </label>
              <label>Unit
                <input value={p.unit}
                  onChange={e => setParam(i, { unit: e.target.value })} />
              </label>
              <label>Type
                <select value={p.resultType}
                  onChange={e => setParam(i, { resultType: e.target.value })}>
                  <option value="numeric">Numeric</option>
                  <option value="qualitative">Qualitative</option>
                </select>
              </label>
              <label>Reference
                <input value={p.referenceRange}
                  onChange={e => setParam(i, { referenceRange: e.target.value })} />
              </label>
              <label>Low
                <input type="number" value={p.low}
                  onChange={e => setParam(i, { low: e.target.value })} />
              </label>
              <label>High
                <input type="number" value={p.high}
                  onChange={e => setParam(i, { high: e.target.value })} />
              </label>
            </div>
          ))}
          <button type="button"
            onClick={() => setForm(f => ({ ...f, parameters: [...f.parameters, { ...emptyParam }] }))}>
            + Parameter
          </button>
          <button type="submit">Save Test</button>
        </form>
      )}

      <div className="card">
        <h2>Existing Tests</h2>
        <table>
          <thead><tr><th>Code</th><th>Name</th><th>Category</th><th>Price</th><th>Params</th></tr></thead>
          <tbody>
            {tests.map(t => (
              <tr key={t._id}>
                <td>{t.testCode}</td>
                <td>{t.testName}</td>
                <td>{t.category}</td>
                <td>{t.price}</td>
                <td>{t.parameters.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}