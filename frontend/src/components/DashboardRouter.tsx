import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import UserDashboard from '../pages/UserDashboard';
import CleanerDashboard from '../pages/CleanerDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import { Navigate } from 'react-router-dom';

const DashboardRouter: React.FC = () => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!currentUser || !userRole) {
    return <Navigate to="/login" />;
  }

  switch (userRole) {
    case UserRole.USER:
      return <UserDashboard />;
    case UserRole.CLEANER:
      return <CleanerDashboard />;
    case UserRole.ADMIN:
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" />;
  }
};

export default DashboardRouter;