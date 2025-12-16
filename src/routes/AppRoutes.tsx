import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../auth/LoginPage';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { ApplicationsPage } from '../features/applications/pages/ApplicationsPage';
import { HistoryPage } from '../features/history/pages/HistoryPage';
import { UsersPage } from '../features/users/pages/UsersPage';
import { HelpPage } from '../features/help/pages/HelpPage';
import { CourtIndexApp } from '../apps/court-index';
import { MasterDeduplicationApp } from '../apps/master-deduplication';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/applications" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route
          path="users"
          element={
            <ProtectedRoute roles={['admin']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route path="help" element={<HelpPage />} />
        
        {/* Court Index App */}
        <Route path="apps/court-index/*" element={<CourtIndexApp />} />
        
        {/* Master Deduplication App */}
        <Route path="apps/master-deduplication/*" element={<MasterDeduplicationApp />} />
      </Route>

      <Route path="*" element={<Navigate to="/applications" replace />} />
    </Routes>
  );
}