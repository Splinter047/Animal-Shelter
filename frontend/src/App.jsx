import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import LayoutGate from './components/LayoutGate.jsx';
import RoleRoute from './components/RoleRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Animals from './pages/Animals.jsx';
import AnimalDetail from './pages/AnimalDetail.jsx';
import MedicalRecords from './pages/MedicalRecords.jsx';

import Adoptions from './pages/Adoptions.jsx';
import Rescues from './pages/Rescues.jsx';
import PublicReport from './pages/PublicReport.jsx';
import PublicAnimals from './pages/PublicAnimals.jsx';

import Employees from './pages/Employees.jsx';
import Surrender from './pages/Surrender.jsx';
import Analytics from './pages/Analytics.jsx';
import AuditLogs from './pages/AuditLogs.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/report-stray" element={<PublicReport />} />
            <Route path="/adopt" element={<PublicAnimals />} />

            <Route element={<LayoutGate />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/animals" element={<Animals />} />
              <Route path="/animals/:id" element={<AnimalDetail />} />
              <Route path="/animals/:id/medical" element={<MedicalRecords />} />
              <Route
                path="/adoptions"
                element={
                  <RoleRoute roles={['Manager', 'Admin']}>
                    <Adoptions />
                  </RoleRoute>
                }
              />
              <Route
                path="/rescues"
                element={
                  <RoleRoute roles={['Manager', 'Rescuer', 'Admin']}>
                    <Rescues />
                  </RoleRoute>
                }
              />
              <Route
                path="/employees"
                element={
                  <RoleRoute roles={['Manager']}>
                    <Employees />
                  </RoleRoute>
                }
              />
              <Route
                path="/surrender"
                element={
                  <RoleRoute roles={['Manager', 'Admin']}>
                    <Surrender />
                  </RoleRoute>
                }
              />
              <Route path="/analytics" element={<Analytics />} />
              <Route
                path="/audit-logs"
                element={
                  <RoleRoute roles={['Manager']}>
                    <AuditLogs />
                  </RoleRoute>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
