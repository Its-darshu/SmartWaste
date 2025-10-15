import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { WasteCategory, Priority } from '../types';
import './ReportWaste.css';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

const ReportWaste: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: WasteCategory.OTHER,
    priority: Priority.MEDIUM
  });
  const [location, setLocation] = useState<LocationData | null>(null);
  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const getCurrentLocation = () => {
    setGettingLocation(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use reverse geocoding to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          
          setLocation({
            lat: latitude,
            lng: longitude,
            address: data.display_name || `${latitude}, ${longitude}`
          });
        } catch (err) {
          setLocation({
            lat: latitude,
            lng: longitude,
            address: `${latitude}, ${longitude}`
          });
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        setError('Error getting location: ' + error.message);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(e.target.files);
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    if (!images || images.length === 0) return [];

    const uploadPromises = Array.from(images).map(async (image) => {
      const imageRef = ref(storage, `waste-reports/${Date.now()}-${image.name}`);
      const snapshot = await uploadBytes(imageRef, image);
      return getDownloadURL(snapshot.ref);
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location) {
      setError('Please get your current location first');
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to submit a report');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Upload images first
      const imageUrls = await uploadImages();

      // Create the waste report
      const reportData = {
        ...formData,
        location,
        images: imageUrls,
        status: 'Pending',
        reportedBy: currentUser.uid,
        reportedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'wasteReports'), reportData);
      
      // Redirect to dashboard on success
      navigate('/dashboard');
    } catch (err: any) {
      setError('Error submitting report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-waste">
      <div className="report-container">
        <h1>Report a Waste Issue</h1>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-section">
            <h3>Issue Details</h3>
            
            <div className="form-group">
              <label htmlFor="title">Issue Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Brief description of the issue"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Detailed Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide more details about the waste issue..."
                rows={4}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  {Object.values(WasteCategory).map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority *</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  required
                >
                  {Object.values(Priority).map(priority => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Location</h3>
            
            <div className="location-section">
              {location ? (
                <div className="location-display">
                  <p><strong>Current Location:</strong></p>
                  <p className="address">{location.address}</p>
                  <p className="coordinates">
                    Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                  </p>
                  <button 
                    type="button" 
                    onClick={getCurrentLocation}
                    className="btn-secondary"
                    disabled={gettingLocation}
                  >
                    Update Location
                  </button>
                </div>
              ) : (
                <div className="location-prompt">
                  <p>We need your location to report the waste issue accurately.</p>
                  <button 
                    type="button" 
                    onClick={getCurrentLocation}
                    className="btn-primary"
                    disabled={gettingLocation}
                  >
                    {gettingLocation ? 'Getting Location...' : 'Get Current Location'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Photos (Optional)</h3>
            
            <div className="form-group">
              <label htmlFor="images">Upload Photos</label>
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              <p className="form-help">
                Upload photos to help authorities understand the issue better.
              </p>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary submit-btn"
              disabled={loading || !location}
            >
              {loading ? 'Submitting Report...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportWaste;