// ================================================================
// App — Root component with routing
// ================================================================
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { AllocationsPage } from './pages/AllocationsPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { UsersPage } from './pages/UsersPage';
import { RoomsPage } from './pages/RoomsPage';
import { AuditPage } from './pages/AuditPage';
import { PortalPage } from './pages/PortalPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { FacultyHubPage } from './pages/FacultyHubPage';

import { ErrorBoundary } from './components/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected routes — require authentication */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/resources" element={<ResourcesPage />} />
                  <Route path="/allocations" element={<AllocationsPage />} />
                  <Route path="/rooms" element={<RoomsPage />} />
                  <Route path="/maintenance" element={<MaintenancePage />} />
                  <Route path="/portal" element={<PortalPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/audit" element={<AuditPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/faculty-hub" element={<FacultyHubPage />} />
                </Route>
              </Route>
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
