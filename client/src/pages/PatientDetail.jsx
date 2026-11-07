import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get(`/patients/${id}`).then(r => setPatient(r.data))
      .catch(e => setErr(e.response?.data?.message || 'Failed'));
    api.get('/orders', { params: { patient: id } })
      .then(r => setOrders(r.data)).catch(() => {});
  }, [id]);

  if (err) return <p className="error">{err}</p>;
  if (!patient) return <p>Loading…</p>;

  return (
    <div>
      <h1>{patient.fullName}</h1>
      <p>MR: <strong>{patient.mrNumber}</strong> · {patient.gender} · {patient.contactNumber}</p>
      <Link to="/visits/new">Create visit for this patient</Link>
      <h2>Orders</h2>
      <table>
        <thead><tr><th>Order</th><th>Test</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {orders.map(o => (
            <tr key={o._id}>
              <td>{o.orderNumber}</td>
              <td>{o.test?.testName || o.testNameSnapshot}</td>
              <td>{o.status}</td>
              <td><Link to={`/results/${o._id}`}>Results</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}