import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { collection, getDocs, query, orderBy, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { WasteReport } from '../types';
import { useAuth } from '../contexts/AuthContext';
import 'leaflet/dist/leaflet.css';
import './Dashboard.css';

// Fix for default markers in React Leaflet
import L from 'leaflet';

let DefaultIcon = L.divIcon({
  html: '🧹',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: 'custom-div-icon'
});

L.Marker.prototype.options.icon = DefaultIcon;

const CleanerDashboard: React.FC = () => {
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [assignedReports, setAssignedReports] = useState<WasteReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchReports();
      fetchAssignedReports();
    }
  }, [currentUser]);

  const fetchReports = async () => {
    try {
      // Fetch pending and in-progress reports for cleaners to see
      const reportsCollection = collection(db, 'wasteReports');
      const q = query(
        reportsCollection, 
        where('status', 'in', ['Pending', 'In Progress']),
        orderBy('reportedAt', 'desc')
      );
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

  const fetchAssignedReports = async () => {
    try {
      // Fetch reports assigned to this cleaner
      const reportsCollection = collection(db, 'wasteReports');
      const q = query(
        reportsCollection, 
        where('assignedTo', '==', currentUser?.uid),
        orderBy('reportedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const assignedReportsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        reportedAt: doc.data().reportedAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as WasteReport[];

      setAssignedReports(assignedReportsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assigned reports:', error);
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      const reportRef = doc(db, 'wasteReports', reportId);
      await updateDoc(reportRef, {
        status: newStatus,
        updatedAt: new Date(),
        ...(newStatus === 'In Progress' && { assignedTo: currentUser?.uid })
      });
      
      // Refresh the reports
      fetchReports();
      fetchAssignedReports();
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  const filteredReports = reports.filter(report => 
    selectedPriority === 'all' || report.priority === selectedPriority
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

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading cleaner dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard cleaner-dashboard">
      <div className="dashboard-header">
        <h1>Cleaner Dashboard</h1>
        <div className="cleaner-info">
          <span>👤 {currentUser?.displayName}</span>
          <span className="role-badge cleaner">Cleaner</span>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card urgent">
          <div className="stat-number">
            {reports.filter(r => r.priority === 'Urgent').length}
          </div>
          <div className="stat-label">Urgent Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{assignedReports.length}</div>
          <div className="stat-label">My Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {assignedReports.filter(r => r.status === 'In Progress').length}
          </div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {assignedReports.filter(r => r.status === 'Resolved').length}
          </div>
          <div className="stat-label">Completed Today</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="map-section">
          <h2>Waste Reports Map</h2>
          <div className="filter-controls">
            <select 
              value={selectedPriority} 
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="priority-filter"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
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
                      <div className="popup-actions">
                        {report.status === 'Pending' && (
                          <button 
                            onClick={() => updateReportStatus(report.id!, 'In Progress')}
                            className="btn btn-primary btn-small"
                          >
                            Accept Task
                          </button>
                        )}
                        {report.status === 'In Progress' && report.assignedTo === currentUser?.uid && (
                          <button 
                            onClick={() => updateReportStatus(report.id!, 'Resolved')}
                            className="btn btn-success btn-small"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="tasks-section">
          <div className="tasks-header">
            <h2>My Assigned Tasks</h2>
          </div>

          <div className="tasks-list">
            {assignedReports.length === 0 ? (
              <div className="no-tasks">
                <p>No tasks assigned yet. Check the map for available tasks.</p>
              </div>
            ) : (
              assignedReports.map(report => (
                <div key={report.id} className={`task-card ${report.priority.toLowerCase()}`}>
                  <div className="task-header">
                    <h3>{report.title}</h3>
                    <div className="task-badges">
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
                  <p className="task-description">{report.description}</p>
                  <div className="task-meta">
                    <span className="task-category">{report.category}</span>
                    <span className="task-date">
                      Reported: {report.reportedAt?.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="task-location">
                    📍 {report.location.address}
                  </div>
                  <div className="task-actions">
                    {report.status === 'In Progress' && (
                      <button 
                        onClick={() => updateReportStatus(report.id!, 'Resolved')}
                        className="btn btn-success"
                      >
                        ✓ Mark as Complete
                      </button>
                    )}
                    {report.status === 'Resolved' && (
                      <span className="completed-badge">✓ Completed</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanerDashboard;