import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Layouts
import { AppLayout } from './components/layout/AppLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { AboutPage } from './pages/public/AboutPage';

// Onboarding
import { OnboardingWizard } from './pages/onboarding/OnboardingWizard';

// Student / General Pages
import { DashboardPage } from './pages/student/DashboardPage';
import { FindMentorPage } from './pages/student/FindMentorPage';
import { MentorProfilePage } from './pages/student/MentorProfilePage';
import { SkillDiscoveryPage } from './pages/student/SkillDiscoveryPage';
import { MySessionsPage } from './pages/sessions/MySessionsPage';
import { ProfilePage } from './pages/student/ProfilePage';
import { EditProfilePage } from './pages/student/EditProfilePage';

// Mentor Pages
import { MentorDashboardPage } from './pages/mentor/MentorDashboardPage';
import { AvailabilityPage } from './pages/mentor/AvailabilityPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UsersManagementPage } from './pages/admin/UsersManagementPage';
import { SkillsManagementPage } from './pages/admin/SkillsManagementPage';
import { SessionsManagementPage } from './pages/admin/SessionsManagementPage';
import { ReviewsManagementPage } from './pages/admin/ReviewsManagementPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Route Guards
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && !user.onboarding_completed && location.pathname !== '/onboarding' && user.role !== 'admin') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated) {
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (!user?.onboarding_completed) return <Navigate to="/onboarding" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Layout Routes */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicOnlyRoute>
                    <RegisterPage />
                  </PublicOnlyRoute>
                }
              />

              {/* Protected Student Routes */}
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <OnboardingWizard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/find-mentor"
                element={
                  <ProtectedRoute>
                    <FindMentorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mentor/:id"
                element={
                  <ProtectedRoute>
                    <MentorProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/skills"
                element={
                  <ProtectedRoute>
                    <SkillDiscoveryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sessions"
                element={
                  <ProtectedRoute>
                    <MySessionsPage />
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
                path="/profile/edit"
                element={
                  <ProtectedRoute>
                    <EditProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mentor"
                element={
                  <ProtectedRoute>
                    <MentorDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mentor/availability"
                element={
                  <ProtectedRoute>
                    <AvailabilityPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Admin Suite Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="users" element={<UsersManagementPage />} />
              <Route path="skills" element={<SkillsManagementPage />} />
              <Route path="sessions" element={<SessionsManagementPage />} />
              <Route path="reviews" element={<ReviewsManagementPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
