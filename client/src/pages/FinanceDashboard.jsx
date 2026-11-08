import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx'; // <-- ADDED

const CATEGORIES = ['Salaries','Rent','Electricity','Internet','Lab Supplies','Maintenance','Transport','Other'];

export default function FinanceDashboard() {
  const { user } = useAuth(); // <-- ADDED
  const [summary, setSummary] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ category: 'Rent', amount: '', note: '' });
  const [err, setErr] = useState('');

  async function load() {
    setErr('');
    try {
      const [s, e] = await Promise.all([
        api.get('/finance/summary'),
        api.get('/finance/expenses')
      ]);
      setSummary(s.data || {});
      setExpenses(e.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to load finance data');
    }
  }
  useEffect(() => { load(); }, []);

  async function addExpense(e) {
    e.preventDefault();
    setErr('');
    try {
      await api.post('/finance/expenses', {
        category: form.category,
        amount: Number(form.amount),
        note: form.note
      });
      setForm({ category: 'Rent', amount: '', note: '' });
      load();
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to add expense');
    }
  }

  // <-- ADDED DELETE FUNCTION
  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await api.delete(`/finance/expenses/${id}`);
      load(); // Refresh data
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete expense');
    }
  }

  const money = (n) => Number(n || 0).toFixed(2);

  return (
    <div>
      <h1>Financial Dashboard</h1>
      {err && <p className="error">{err}</p>}

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat"><h3>{money(summary.grossBilled)}</h3><p>Gross Billed</p></div>
        <div className="stat"><h3>{money(summary.totalDiscount)}</h3><p>Discounts</p></div>
        <div className="stat"><h3>{money(summary.netBilled)}</h3><p>Net Billed</p></div>
        <div className="stat"><h3>{money(summary.collected)}</h3><p>Collected</p></div>
        <div className="stat"><h3>{money(summary.outstanding)}</h3><p>Outstanding</p></div>
        <div className="stat"><h3>{money(summary.totalExpenses)}</h3><p>Expenses</p></div>
        <div className="stat" style={{ background: '#eff6ff' }}>
          <h3>{money(summary.netCash)}</h3><p>Net Cash</p>
        </div>
      </div>

      <form onSubmit={addExpense} className="card">
        <h3>Add Expense</h3>
        <div className="row">
          <label>Category
            <select value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>Amount
            <input type="number" value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00" required />
          </label>
          <label>Note
            <input value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
              placeholder="optional" />
          </label>
          <button type="submit">Add Expense</button>
        </div>
      </form>

      <div className="card">
        <h3>Expense History</h3>
        {expenses.length === 0 && <p>No expenses recorded yet.</p>}
        
        {expenses.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Note</th>
                <th>Recorded By</th>
                {/* ADDED ACTIONS COLUMN */}
                <th>Actions</th> 
              </tr>
            </thead>
            <tbody>
              {expenses.map(x => (
                <tr key={x._id}>
                  <td>{new Date(x.date).toLocaleDateString()}</td>
                  <td>{x.category}</td>
                  <td>{money(x.amount)}</td>
                  <td>{x.note || '—'}</td>
                  <td>{x.recordedBy?.name || '—'}</td>
                  
                  {/* ADDED DELETE BUTTON */}
                  <td>
                    {user?.role === 'admin' ? (
                      <button 
                        onClick={() => handleDelete(x._id)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 0, fontWeight: 'bold' }}
                        title="Delete Expense"
                      >
                        🗑️ Delete
                      </button>
                    ) : (
                      <span className="muted" style={{ fontSize: 12 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}