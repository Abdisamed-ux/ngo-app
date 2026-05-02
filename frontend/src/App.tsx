
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { Dashboard } from './pages/Dashboard.js';
import { DonationsPage } from './pages/DonationsPage.js';
import { AidRequestsPage } from './pages/AidRequestsPage.js';
import { CasesPage } from './pages/CasesPage.js';
import { ReportsPage } from './pages/ReportsPage.js';
import { UsersPage } from './pages/UsersPage.js';
import { AuditLogsPage } from './pages/AuditLogsPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { DonorDashboard } from './pages/DonorDashboard.js';
import { MessagesPage } from './pages/MessagesPage.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donations"
            element={
              <ProtectedRoute allowedRoles={['NGO_ADMIN', 'SUPER_ADMIN']}>
                <DonationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor-dashboard"
            element={
              <ProtectedRoute allowedRoles={['DONOR']}>
                <DonorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/aid-requests"
            element={
              <ProtectedRoute>
                <AidRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cases"
            element={
              <ProtectedRoute>
                <CasesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['NGO_ADMIN', 'SUPER_ADMIN']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['NGO_ADMIN', 'SUPER_ADMIN']}>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
