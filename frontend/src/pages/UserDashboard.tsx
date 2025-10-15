import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { WasteReport } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './Dashboard.css';

// Fix for default markers in React Leaflet
import L from 'leaflet';

let DefaultIcon = L.divIcon({
  html: '📍',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: 'custom-div-icon'
});

L.Marker.prototype.options.icon = DefaultIcon;

const UserDashboard: React.FC = () => {
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [userReports, setUserReports] = useState<WasteReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchReports();
      fetchUserReports();
    }
  }, [currentUser]);

  const fetchReports = async () => {
    try {
      const reportsCollection = collection(db, 'wasteReports');
      const q = query(reportsCollection, orderBy('reportedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const reportsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        reportedAt: doc.data().reportedAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as WasteReport[];

      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchUserReports = async () => {
    try {
      const reportsCollection = collection(db, 'wasteReports');
      const q = query(
        reportsCollection, 
        where('reportedBy', '==', currentUser?.uid),
        orderBy('reportedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const userReportsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        reportedAt: doc.data().reportedAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as WasteReport[];

      setUserReports(userReportsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user reports:', error);
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => 
    selectedCategory === 'all' || report.category === selectedCategory
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return '#f39c12';
      case 'In Progress': return '#3498db';
      case 'Resolved': return '#27ae60';
      case 'Closed': return '#95a5a6';
      default: return '#f39c12';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard user-dashboard">
      <div className="dashboard-header">
        <h1>My Waste Reports Dashboard</h1>
        <Link to="/report" className="btn btn-primary">
          + Report New Issue
        </Link>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{userReports.length}</div>
          <div className="stat-label">My Reports</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {userReports.filter(r => r.status === 'Pending').length}
          </div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {userReports.filter(r => r.status === 'Resolved').length}
          </div>
          <div className="stat-label">Resolved</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{reports.length}</div>
          <div className="stat-label">Community Reports</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="map-section">
          <h2>Community Waste Reports Map</h2>
          <div className="map-container">
            <MapContainer 
              center={[28.6139, 77.2090]} // Delhi coordinates as default
              zoom={12} 
              style={{ height: '400px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredReports.map(report => (
                <Marker 
                  key={report.id} 
                  position={[report.location.lat, report.location.lng]}
                >
                  <Popup>
                    <div className="popup-content">
                      <h4>{report.title}</h4>
                      <p><strong>Category:</strong> {report.category}</p>
                      <p><strong>Status:</strong> 
                        <span 
                          className="status-badge" 
                          style={{ backgroundColor: getStatusColor(report.status) }}
                        >
                          {report.status}
                        </span>
                      </p>
                      <p><strong>Location:</strong> {report.location.address}</p>
                      <p><strong>Reported:</strong> {report.reportedAt?.toLocaleDateString()}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="reports-section">
          <div className="reports-header">
            <h2>My Recent Reports</h2>
          </div>

          <div className="reports-list">
            {userReports.length === 0 ? (
              <div className="no-reports">
                <p>You haven't reported any waste issues yet.</p>
                <Link to="/report" className="btn btn-primary">
                  Report Your First Issue
                </Link>
              </div>
            ) : (
              userReports.map(report => (
                <div key={report.id} className="report-card">
                  <div className="report-header">
                    <h3>{report.title}</h3>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(report.status) }}
                    >
                      {report.status}
                    </span>
                  </div>
                  <p className="report-description">{report.description}</p>
                  <div className="report-meta">
                    <span className="report-category">{report.category}</span>
                    <span className="report-date">
                      {report.reportedAt?.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="report-location">
                    📍 {report.location.address}
                  </div>
                  {report.status === 'Pending' && (
                    <div className="report-actions">
                      <button className="btn btn-secondary btn-small">
                        Edit Report
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;