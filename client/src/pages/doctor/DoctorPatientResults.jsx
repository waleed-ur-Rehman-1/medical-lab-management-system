import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios.js';

export default function DoctorPatientResults() {
  const { id } = useParams();
  const [results, setResults] = useState([]);
  useEffect(() => {
    api.get(`/doctor/patients/${id}/results`)
      .then(r => setResults(r.data))
      .catch(() => setResults([]));
  }, [id]);
  return (
    <div>
      <h1>Approved Results</h1>
      {results.map(r => (
        <div key={r._id} className="card">
          <h3>{r.test?.testName}</h3>
          <p>Approved: {new Date(r.verifiedAt).toLocaleString()}</p>
          <Link to={`/print/result/${r._id}`} target="_blank" rel="noopener" className="btn">
            🖨️ Print / PDF
          </Link>
        </div>
      ))}
    </div>
  );
}