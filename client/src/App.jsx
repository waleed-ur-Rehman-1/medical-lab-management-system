import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Patients from './pages/Patients.jsx';
import PatientDetail from './pages/PatientDetail.jsx';
import NewVisit from './pages/NewVisit.jsx';
import Tests from './pages/Tests.jsx';
import Orders from './pages/Orders.jsx';
import ResultEntry from './pages/ResultEntry.jsx';
import Invoices from './pages/Invoices.jsx';
import InvoiceDetail from './pages/InvoiceDetail.jsx';
import Payments from './pages/Payments.jsx';
import LinkAccount from './pages/LinkAccount.jsx';
import MyResults from './pages/MyResults.jsx';
import MyInvoices from './pages/MyInvoices.jsx';
import PrintInvoice from './pages/PrintInvoice.jsx';
import PrintResult from './pages/PrintResult.jsx';
import FinanceDashboard from './pages/FinanceDashboard.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AuditLogs from './pages/AuditLogs.jsx';
import WhatsAppLog from './pages/WhatsAppLog.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RoleGuard({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function PatientLinkGuard({ children }) {
  const { user } = useAuth();
  if (user?.role === 'patient' && !user.patientProfile)
    return <Navigate to="/link-account" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/link-account" element={<Protected><LinkAccount /></Protected>} />

      <Route path="/print/invoice/:id" element={<Protected><PrintInvoice /></Protected>} />
      <Route path="/print/result/:id" element={<Protected><PrintResult /></Protected>} />

      <Route element={<Protected><Layout /></Protected>}>
        <Route index element={<Dashboard />} />

        <Route path="patients" element={
          <RoleGuard roles={['admin','receptionist','technician','accountant']}><Patients /></RoleGuard>
        } />
        <Route path="patients/:id" element={
          <RoleGuard roles={['admin','receptionist','technician','accountant']}><PatientDetail /></RoleGuard>
        } />
        <Route path="visits/new" element={
          <RoleGuard roles={['admin','receptionist']}><NewVisit /></RoleGuard>
        } />
        <Route path="tests" element={
          <RoleGuard roles={['admin','receptionist','technician']}><Tests /></RoleGuard>
        } />
        <Route path="orders" element={
          <RoleGuard roles={['admin','receptionist','technician']}><Orders /></RoleGuard>
        } />
        <Route path="results/:orderId" element={
          <RoleGuard roles={['admin','technician']}><ResultEntry /></RoleGuard>
        } />
        <Route path="invoices" element={
          <RoleGuard roles={['admin','receptionist','accountant']}><Invoices /></RoleGuard>
        } />
        <Route path="invoices/:id" element={
          <RoleGuard roles={['admin','receptionist','accountant']}><InvoiceDetail /></RoleGuard>
        } />
        <Route path="payments" element={
          <RoleGuard roles={['admin','receptionist','accountant']}><Payments /></RoleGuard>
        } />

        {/* NEW */}
        <Route path="finance" element={
          <RoleGuard roles={['admin','accountant']}><FinanceDashboard /></RoleGuard>
        } />
        <Route path="admin/users" element={
          <RoleGuard roles={['admin']}><AdminUsers /></RoleGuard>
        } />
        <Route path="admin/audit" element={
          <RoleGuard roles={['admin']}><AuditLogs /></RoleGuard>
        } />
        <Route path="admin/whatsapp" element={
          <RoleGuard roles={['admin']}><WhatsAppLog /></RoleGuard>
        } />

        <Route path="my/results" element={
          <PatientLinkGuard><RoleGuard roles={['patient']}><MyResults /></RoleGuard></PatientLinkGuard>
        } />
        <Route path="my/invoices" element={
          <PatientLinkGuard><RoleGuard roles={['patient']}><MyInvoices /></RoleGuard></PatientLinkGuard>
        } />
      </Route>

      <Route path="*" element={<Navigate to={user?.role === 'patient' ? '/my/results' : '/'} replace />} />
    </Routes>
  );
}