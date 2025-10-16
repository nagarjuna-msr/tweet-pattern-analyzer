import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { isAuthenticated } from './lib/auth';

// Pages
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import ProfileSubmission from './pages/ProfileSubmission';
import AnalysisResults from './pages/AnalysisResults';
import ContentSubmission from './pages/ContentSubmission';
import TweetsView from './pages/TweetsView';
import Admin from './pages/Admin';
import AdminSubmissions from './pages/AdminSubmissions';
import AdminContent from './pages/AdminContent';
import AdminUsers from './pages/AdminUsers';
import AdminUserDetail from './pages/AdminUserDetail';
import MyContent from './pages/MyContent';

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Public Route Component (redirect based on user role if authenticated)
function PublicRoute({ children }) {
  if (isAuthenticated()) {
    // Will redirect to dashboard by default, admin users will be redirected to /admin after login
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          {/* Protected Routes */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profiles/submit"
            element={
              <ProtectedRoute>
                <ProfileSubmission />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis/:submissionId"
            element={
              <ProtectedRoute>
                <AnalysisResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="/content/submit"
            element={
              <ProtectedRoute>
                <ContentSubmission />
              </ProtectedRoute>
            }
          />
          <Route
            path="/content/:ideaId/tweets"
            element={
              <ProtectedRoute>
                <TweetsView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/submissions"
            element={
              <ProtectedRoute>
                <AdminSubmissions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/content"
            element={
              <ProtectedRoute>
                <AdminContent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:userId"
            element={
              <ProtectedRoute>
                <AdminUserDetail />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Toast Notifications */}
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

export default App;
