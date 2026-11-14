import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';

// Public Pages
import Login from '../pages/Login';
import Register from '../pages/Register';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import BookCatalog from '../pages/admin/BookCatalog';
import MembersManagement from '../pages/admin/MembersManagement';
import BorrowManagement from '../pages/admin/BorrowManagement';
import DueReminders from '../pages/admin/DueReminders';
import FineManagement from '../pages/admin/FineManagement';
import PaymentsList from '../pages/admin/PaymentsList';
import ReportsAnalytics from '../pages/admin/ReportsAnalytics';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import BrowseBooks from '../pages/student/BrowseBooks';
import MyBorrowedBooks from '../pages/student/MyBorrowedBooks';
import MyFinesPayments from '../pages/student/MyFinesPayments';
import MyNotifications from '../pages/student/MyNotifications';
import StudentProfile from '../pages/student/StudentProfile';

// Loading Spinner
import LoadingSpinner from '../components/LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Checking credentials..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // If student trying to access admin route or vice versa
    return (
      <Navigate
        to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
        replace
      />
    );
  }

  return children;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Initializing Library Management Portal..." />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
              replace
            />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          user ? (
            <Navigate
              to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
              replace
            />
          ) : (
            <Register />
          )
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="books" element={<BookCatalog />} />
        <Route path="members" element={<MembersManagement />} />
        <Route path="borrow" element={<BorrowManagement />} />
        <Route path="reminders" element={<DueReminders />} />
        <Route path="fines" element={<FineManagement />} />
        <Route path="payments" element={<PaymentsList />} />
        <Route path="reports" element={<ReportsAnalytics />} />
      </Route>

      {/* Student Protected Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute requiredRole="student">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="catalog" element={<BrowseBooks />} />
        <Route path="my-books" element={<MyBorrowedBooks />} />
        <Route path="fines" element={<MyFinesPayments />} />
        <Route path="notifications" element={<MyNotifications />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* Root redirect */}
      <Route
        path="/"
        element={
          <Navigate
            to={
              user
                ? user.role === 'admin'
                  ? '/admin/dashboard'
                  : '/student/dashboard'
                : '/login'
            }
            replace
          />
        }
      />

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
