import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import CleanerDashboard from '../pages/CleanerDashboard';
import PrivateRoute from './PrivateRoute';
import RoleBasedRoute from './RoleBasedRoute';
import { UserRole } from '../types';

const CleanerRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <RoleBasedRoute allowedRoles={[UserRole.CLEANER]}>
            <CleanerDashboard />
          </RoleBasedRoute>
        </PrivateRoute>
      } />
    </Routes>
  );
};

export default CleanerRoutes;