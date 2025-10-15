import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import UserDashboard from '../pages/UserDashboard';
import ReportWaste from '../pages/ReportWaste';
import PrivateRoute from './PrivateRoute';
import RoleBasedRoute from './RoleBasedRoute';
import { UserRole } from '../types';

const UserRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <RoleBasedRoute allowedRoles={[UserRole.USER]}>
            <UserDashboard />
          </RoleBasedRoute>
        </PrivateRoute>
      } />
      <Route path="/report" element={
        <PrivateRoute>
          <RoleBasedRoute allowedRoles={[UserRole.USER]}>
            <ReportWaste />
          </RoleBasedRoute>
        </PrivateRoute>
      } />
    </Routes>
  );
};

export default UserRoutes;