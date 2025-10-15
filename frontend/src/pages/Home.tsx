import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

const Home: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Smart Waste Reporting System</h1>
          <p>
            Help keep your community clean by reporting waste issues. 
            Together, we can make our neighborhoods safer and more sustainable.
          </p>
          {currentUser ? (
            <div className="hero-actions">
              <Link to="/report" className="btn btn-primary">
                Report Waste Issue
              </Link>
              <Link to="/dashboard" className="btn btn-secondary">
                View Dashboard
              </Link>
            </div>
          ) : (
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2>Why Use SmartWaste?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Location-Based Reporting</h3>
              <p>Report waste issues with precise location data and photos</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3>Interactive Map</h3>
              <p>View all reported issues on an interactive map in real-time</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Quick Response</h3>
              <p>Get updates on the status of your reported issues</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌱</div>
              <h3>Community Impact</h3>
              <p>Work together to create cleaner, healthier communities</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;