import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { eventAPI, photoAPI, guestAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaQrcode, FaDownload, FaUpload, FaUsers, FaImages, FaCog } from 'react-icons/fa';
import { format } from 'date-fns';
import { getImageUrl } from '../utils/imageHelper';
import './EventDetails.css';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [guests, setGuests] = useState([]);
  const [activeTab, setActiveTab] = useState('photos');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const [eventRes, photosRes, guestsRes] = await Promise.all([
        eventAPI.getOne(id),
        photoAPI.getAll(id, {}),
        guestAPI.getAll(id, {})
      ]);

      setEvent(eventRes.data.data);
      setPhotos(photosRes.data.data);
      setGuests(guestsRes.data.data);
    } catch (error) {
      toast.error('Failed to fetch event details');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append('photos', files[i]);
    }

    try {
      await photoAPI.upload(id, formData);
      toast.success(`${files.length} photo(s) uploaded successfully!`);
      fetchEventDetails();
    } catch (error) {
      toast.error('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const toggleDownloads = async () => {
    try {
      await eventAPI.toggleDownloads(id);
      toast.success('Download settings updated');
      fetchEventDetails();
    } catch (error) {
      toast.error('Failed to update download settings');
    }
  };

  const downloadQRCode = () => {
    if (event?.qrCode) {
      const link = document.createElement('a');
      link.href = event.qrCode;
      link.download = `${event.eventName}-QRCode.png`;
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="card text-center">
          <h2>Event not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="event-details-container">
      <div className="container">
        <div className="event-details-header">
          <div>
            <h1>{event.eventName}</h1>
            <p>{event.clientName} • {format(new Date(event.eventDate), 'MMMM dd, yyyy')}</p>
          </div>
          <div className="event-actions">
            <button className="btn btn-outline" onClick={downloadQRCode}>
              <FaQrcode /> Download QR
            </button>
            <button
              className={`btn ${event.downloadsEnabled ? 'btn-danger' : 'btn-success'}`}
              onClick={toggleDownloads}
            >
              <FaDownload /> {event.downloadsEnabled ? 'Disable' : 'Enable'} Downloads
            </button>
          </div>
        </div>

        <div className="event-stats-bar">
          <div className="stat">
            <FaImages />
            <span>{event.totalPhotos} Photos</span>
          </div>
          <div className="stat">
            <FaUsers />
            <span>{guests.length} Guests</span>
          </div>
          <div className="stat">
            <span className="access-code">Access Code: <strong>{event.accessCode}</strong></span>
          </div>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'photos' ? 'active' : ''}`}
            onClick={() => setActiveTab('photos')}
          >
            <FaImages /> Photos ({photos.length})
          </button>
          <button
            className={`tab ${activeTab === 'guests' ? 'active' : ''}`}
            onClick={() => setActiveTab('guests')}
          >
            <FaUsers /> Guests ({guests.length})
          </button>
          <button
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FaCog /> Settings
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'photos' && (
            <div>
              <div className="upload-section">
                <label className="upload-btn">
                  <FaUpload /> {uploading ? 'Uploading...' : 'Upload Photos'}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {photos.length > 0 ? (
                <div className="photos-grid">
                  {photos.map((photo) => (
                    <div key={photo._id} className="photo-item">
                      <img
                        src={getImageUrl(photo)}
                        alt={photo.originalName}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=Photo';
                        }}
                      />
                      <div className="photo-info">
                        <p>{photo.originalName}</p>
                        <div className="photo-stats">
                          <span>{photo.views} views</span>
                          <span>{photo.downloads} downloads</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FaImages className="empty-icon" />
                  <h3>No photos uploaded yet</h3>
                  <p>Upload photos to start sharing with guests</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'guests' && (
            <div>
              <div className="guests-list">
                {guests.length > 0 ? (
                  guests.map((guest) => (
                    <div key={guest._id} className="guest-item">
                      <div className="guest-info">
                        <h4>{guest.name}</h4>
                        <p>{guest.email || 'No email'}</p>
                      </div>
                      <div className="guest-stats">
                        <span>{guest.photoCount} photos</span>
                        <span className="badge badge-primary">{guest.guestId}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <FaUsers className="empty-icon" />
                    <h3>No guests added yet</h3>
                    <p>Add guests and tag them in photos</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-panel">
              <div className="card">
                <h3>Event Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Event Type:</strong>
                    <span>{event.eventType}</span>
                  </div>
                  <div className="info-item">
                    <strong>Gallery Type:</strong>
                    <span>{event.galleryType}</span>
                  </div>
                  <div className="info-item">
                    <strong>Status:</strong>
                    <span className={`badge badge-${event.status === 'active' ? 'success' : 'warning'}`}>
                      {event.status}
                    </span>
                  </div>
                  {event.location?.venue && (
                    <div className="info-item">
                      <strong>Venue:</strong>
                      <span>{event.location.venue}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <h3>QR Code</h3>
                <p>Share this QR code with guests for easy access to the gallery</p>
                {event.qrCode && (
                  <div className="qr-code-display">
                    <img src={event.qrCode} alt="Event QR Code" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
