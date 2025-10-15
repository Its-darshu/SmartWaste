import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { currentUser, userRole, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const getRoleDisplayName = (role: UserRole | null) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Admin';
      case UserRole.CLEANER:
        return 'Cleaner';
      case UserRole.USER:
        return 'User';
      default:
        return '';
    }
  };

  const getDashboardRoute = (role: UserRole | null) => {
    switch (role) {
      case UserRole.ADMIN:
        return '/admin-dashboard';
      case UserRole.CLEANER:
        return '/cleaner-dashboard';
      case UserRole.USER:
        return '/user-dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          🗑️ SmartWaste
        </Link>
        <div className="nav-menu">
          {currentUser ? (
            <>
              <Link to={getDashboardRoute(userRole)} className="nav-link">
                Dashboard
              </Link>
              {(userRole === UserRole.USER || userRole === UserRole.CLEANER) && (
                <Link to="/report" className="nav-link">
                  Report Waste
                </Link>
              )}
              {userRole === UserRole.ADMIN && (
                <>
                  <Link to="/report" className="nav-link">
                    Add Report
                  </Link>
                  <Link to="/admin-dashboard" className="nav-link">
                    Manage System
                  </Link>
                </>
              )}
              <div className="nav-user-info">
                <span className="nav-user">
                  {currentUser.displayName || currentUser.email}
                </span>
                {userRole && (
                  <span className="nav-role">
                    ({getRoleDisplayName(userRole)})
                  </span>
                )}
              </div>
              <button onClick={handleLogout} className="nav-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;