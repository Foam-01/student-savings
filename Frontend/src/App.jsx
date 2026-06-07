import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Home/Dashboard';
import Students from './pages/Students/Students';
import Transactions from './pages/Transactions/Transactions';
import Reports from './pages/Reports/Reports';
import SettingsPage from './pages/Settings/Settings';
import ActivityLog from './pages/ActivityLog/ActivityLog';
import Help from './pages/Help/Help';
import MyQR from './pages/MyQR/MyQR';
import SavingGoals from './pages/SavingGoals/SavingGoals';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import InterestCalculator from './pages/InterestCalculator/InterestCalculator';
import SavingsBuckets from './pages/SavingsBuckets/SavingsBuckets';

// 🛡️ คอมโพเนนต์ป้องกันสิทธิ์การเข้าถึง (Protected Route)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen" role="status" aria-live="polite">
        <div className="spinner-border" aria-hidden="true" />
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen" role="status" aria-live="polite">
        <div className="spinner-border" aria-hidden="true" />
        <p>กำลังโหลด...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <AuthLayout>{children}</AuthLayout>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <Students />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity-log"
            element={
              <ProtectedRoute>
                <ActivityLog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <Help />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-qr"
            element={
              <ProtectedRoute>
                <MyQR />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saving-goals"
            element={
              <ProtectedRoute>
                <SavingGoals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interest-calculator"
            element={
              <ProtectedRoute>
                <InterestCalculator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/savings-buckets"
            element={
              <ProtectedRoute>
                <SavingsBuckets />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;