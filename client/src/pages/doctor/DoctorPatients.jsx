import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  useEffect(() => { api.get('/doctor/patients').then(r => setPatients(r.data)); }, []);
  return (
    <div>
      <h1>Referred Patients</h1>
      {patients.length === 0 && <p>No referred patients yet.</p>}
      <table>
        <thead><tr><th>MR</th><th>Name</th><th>Gender</th><th>Age</th><th></th></tr></thead>
        <tbody>
          {patients.map(p => (
            <tr key={p._id}>
              <td>{p.mrNumber}</td><td>{p.fullName}</td><td>{p.gender}</td><td>{p.age || '—'}</td>
              <td><Link to={`/doctor/patients/${p._id}/results`}>View Results</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}