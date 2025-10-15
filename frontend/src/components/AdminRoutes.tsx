import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AdminDashboard from '../pages/AdminDashboard';
import PrivateRoute from './PrivateRoute';
import RoleBasedRoute from './RoleBasedRoute';
import { UserRole } from '../types';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <RoleBasedRoute allowedRoles={[UserRole.ADMIN]}>
            <AdminDashboard />
          </RoleBasedRoute>
        </PrivateRoute>
      } />
    </Routes>
  );
};

export default AdminRoutes;