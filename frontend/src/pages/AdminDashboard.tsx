import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { collection, getDocs, query, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { WasteReport, User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import 'leaflet/dist/leaflet.css';
import './Dashboard.css';

// Fix for default markers in React Leaflet
import L from 'leaflet';

let DefaultIcon = L.divIcon({
  html: '⚙️',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: 'custom-div-icon'
});

L.Marker.prototype.options.icon = DefaultIcon;

const AdminDashboard: React.FC = () => {
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [cleaners, setCleaners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'reports' | 'users' | 'analytics'>('reports');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchReports();
      fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const querySnapshot = await getDocs(usersCollection);
      
      const usersData = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as User[];

      setUsers(usersData);
      setCleaners(usersData.filter(user => user.role === 'cleaner'));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: string, assignedTo?: string) => {
    try {
      const reportRef = doc(db, 'wasteReports', reportId);
      const updateData: any = {
        status: newStatus,
        updatedAt: new Date()
      };
      
      if (assignedTo) {
        updateData.assignedTo = assignedTo;
      }
      
      await updateDoc(reportRef, updateData);
      fetchReports();
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  const deleteReport = async (reportId: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await deleteDoc(doc(db, 'wasteReports', reportId));
        fetchReports();
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  const filteredReports = reports.filter(report => 
    selectedStatus === 'all' || report.status === selectedStatus
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return '#2ecc71';
      case 'Medium': return '#f39c12';
      case 'High': return '#e67e22';
      case 'Urgent': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  // Analytics calculations
  const analyticsData = {
    totalReports: reports.length,
    pendingReports: reports.filter(r => r.status === 'Pending').length,
    inProgressReports: reports.filter(r => r.status === 'In Progress').length,
    resolvedReports: reports.filter(r => r.status === 'Resolved').length,
    urgentReports: reports.filter(r => r.priority === 'Urgent').length,
    totalUsers: users.filter(u => u.role === 'user').length,
    totalCleaners: cleaners.length,
    avgResolutionTime: '2.5 days', // This would be calculated from actual data
    categoryBreakdown: {
      'Garbage Overflow': reports.filter(r => r.category === 'Garbage Overflow').length,
      'Illegal Dumping': reports.filter(r => r.category === 'Illegal Dumping').length,
      'Recycling Issue': reports.filter(r => r.category === 'Recycling Issue').length,
      'Hazardous Waste': reports.filter(r => r.category === 'Hazardous Waste').length,
      'Dead Animal': reports.filter(r => r.category === 'Dead Animal').length,
      'Other': reports.filter(r => r.category === 'Other').length,
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-info">
          <span>👤 {currentUser?.displayName}</span>
          <span className="role-badge admin">Administrator</span>
        </div>
      </div>

      <div className="admin-nav">
        <button 
          className={`nav-btn ${selectedView === 'reports' ? 'active' : ''}`}
          onClick={() => setSelectedView('reports')}
        >
          📊 Reports Management
        </button>
        <button 
          className={`nav-btn ${selectedView === 'users' ? 'active' : ''}`}
          onClick={() => setSelectedView('users')}
        >
          👥 User Management
        </button>
        <button 
          className={`nav-btn ${selectedView === 'analytics' ? 'active' : ''}`}
          onClick={() => setSelectedView('analytics')}
        >
          📈 Analytics
        </button>
      </div>

      {selectedView === 'analytics' && (
        <div className="analytics-section">
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-number">{analyticsData.totalReports}</div>
              <div className="stat-label">Total Reports</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{analyticsData.totalUsers}</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{analyticsData.totalCleaners}</div>
              <div className="stat-label">Cleaners</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{analyticsData.avgResolutionTime}</div>
              <div className="stat-label">Avg Resolution</div>
            </div>
          </div>

          <div className="analytics-content">
            <div className="analytics-card">
              <h3>Status Breakdown</h3>
              <div className="status-breakdown">
                <div className="status-item">
                  <span className="status-label">Pending:</span>
                  <span className="status-count">{analyticsData.pendingReports}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">In Progress:</span>
                  <span className="status-count">{analyticsData.inProgressReports}</span>
                </div>
                <div className="status-item">
                  <span className="status-label">Resolved:</span>
                  <span className="status-count">{analyticsData.resolvedReports}</span>
                </div>
              </div>
            </div>

            <div className="analytics-card">
              <h3>Category Distribution</h3>
              <div className="category-breakdown">
                {Object.entries(analyticsData.categoryBreakdown).map(([category, count]) => (
                  <div key={category} className="category-item">
                    <span className="category-label">{category}:</span>
                    <span className="category-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'reports' && (
        <div className="reports-management">
          <div className="reports-controls">
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="dashboard-content">
            <div className="map-section">
              <h2>All Reports Map</h2>
              <div className="map-container">
                <MapContainer 
                  center={[28.6139, 77.2090]}
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
                          <p><strong>Priority:</strong> 
                            <span 
                              className="priority-badge" 
                              style={{ backgroundColor: getPriorityColor(report.priority) }}
                            >
                              {report.priority}
                            </span>
                          </p>
                          <p><strong>Status:</strong> 
                            <span 
                              className="status-badge" 
                              style={{ backgroundColor: getStatusColor(report.status) }}
                            >
                              {report.status}
                            </span>
                          </p>
                          <div className="admin-popup-actions">
                            <select 
                              onChange={(e) => updateReportStatus(report.id!, e.target.value)}
                              defaultValue={report.status}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                              <option value="Closed">Closed</option>
                            </select>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>

            <div className="reports-list-section">
              <h2>Reports Management</h2>
              <div className="reports-table">
                {filteredReports.map(report => (
                  <div key={report.id} className="admin-report-card">
                    <div className="report-header">
                      <h3>{report.title}</h3>
                      <div className="report-badges">
                        <span 
                          className="priority-badge" 
                          style={{ backgroundColor: getPriorityColor(report.priority) }}
                        >
                          {report.priority}
                        </span>
                        <span 
                          className="status-badge" 
                          style={{ backgroundColor: getStatusColor(report.status) }}
                        >
                          {report.status}
                        </span>
                      </div>
                    </div>
                    <div className="report-details">
                      <p><strong>Category:</strong> {report.category}</p>
                      <p><strong>Location:</strong> {report.location.address}</p>
                      <p><strong>Reported:</strong> {report.reportedAt?.toLocaleDateString()}</p>
                      {report.assignedTo && (
                        <p><strong>Assigned to:</strong> {report.assignedTo}</p>
                      )}
                    </div>
                    <div className="admin-actions">
                      <select 
                        onChange={(e) => updateReportStatus(report.id!, e.target.value)}
                        defaultValue={report.status}
                        className="status-select"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                      <select 
                        onChange={(e) => e.target.value && updateReportStatus(report.id!, report.status, e.target.value)}
                        defaultValue={report.assignedTo || ''}
                        className="cleaner-select"
                      >
                        <option value="">Assign Cleaner</option>
                        {cleaners.map(cleaner => (
                          <option key={cleaner.uid} value={cleaner.uid}>
                            {cleaner.displayName}
                          </option>
                        ))}
                      </select>
                      <button 
                        onClick={() => deleteReport(report.id!)}
                        className="btn btn-danger btn-small"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'users' && (
        <div className="users-management">
          <h2>User Management</h2>
          <div className="users-stats">
            <div className="stat-card">
              <div className="stat-number">{users.filter(u => u.role === 'user').length}</div>
              <div className="stat-label">Citizens</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{cleaners.length}</div>
              <div className="stat-label">Cleaners</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{users.filter(u => u.role === 'admin').length}</div>
              <div className="stat-label">Administrators</div>
            </div>
          </div>
          <div className="users-list">
            {users.map(user => (
              <div key={user.uid} className="user-card">
                <div className="user-info">
                  <h4>{user.displayName}</h4>
                  <p>{user.email}</p>
                  <span className={`role-badge ${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </div>
                {user.role === 'cleaner' && user.assignedArea && (
                  <div className="cleaner-details">
                    <p><strong>Assigned Area:</strong> {user.assignedArea}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;