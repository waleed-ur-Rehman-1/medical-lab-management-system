import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data))
      .catch(e => setErr(e.response?.data?.message || 'Failed'));
  }, []);

  return (
    <div>
      <h1>Orders</h1>
      {err && <p className="error">{err}</p>}
      <table>
        <thead><tr><th>Order #</th><th>Patient</th><th>Test</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {orders.map(o => (
            <tr key={o._id}>
              <td>{o.orderNumber}</td>
              <td>{o.patient?.mrNumber} — {o.patient?.fullName}</td>
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