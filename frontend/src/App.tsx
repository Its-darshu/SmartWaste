import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import UserRoutes from './components/UserRoutes';
import CleanerRoutes from './components/CleanerRoutes';
import AdminRoutes from './components/AdminRoutes';
import './App.css';

function App() {
  const role = process.env.REACT_APP_ROLE;

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          {role === 'user' && <UserRoutes />}
          {role === 'cleaner' && <CleanerRoutes />}
          {role === 'admin' && <AdminRoutes />}
          {!role && <UserRoutes />} {/* Default to user routes if no role specified */}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
