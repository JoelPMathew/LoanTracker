
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoansPage from './pages/AdminLoansPage';
import AdminUsersPage from './pages/AdminUsersPage';
import NewLoanApplication from './pages/NewLoanApplication';
import LoanDetailsPage from './pages/LoanDetailsPage';
import ProfilePage from './pages/ProfilePage';
import { User } from './types';
import api from './api/axios';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await api.get('/auth/user');
          setUser(data);
        } catch (err) {
          console.error('Auth verification failed', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
    if (loading) return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

    if (!user) return <Navigate to="/login" replace />;
    if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;

    return <>{children}</>;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage onLogin={setUser} />} />
        <Route path="/signup" element={<SignUpPage onLogin={setUser} />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/loans"
          element={
            <ProtectedRoute adminOnly>
              <AdminLoansPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-loan"
          element={
            <ProtectedRoute>
              <NewLoanApplication />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loan/:id"
          element={
            <ProtectedRoute>
              <LoanDetailsPage />
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
