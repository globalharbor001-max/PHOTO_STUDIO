import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { eventAPI, photoAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaDownload, FaImages, FaLock } from 'react-icons/fa';
import { format } from 'date-fns';
import { getImageUrl } from '../utils/imageHelper';
import './GuestGallery.css';

const GuestGallery = () => {
  const { accessCode } = useParams();
  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGallery();
  }, [accessCode]);

  const fetchGallery = async () => {
    try {
      const eventRes = await eventAPI.getByAccessCode(accessCode);
      setEvent(eventRes.data.data);

      const photosRes = await photoAPI.getAll(eventRes.data.data._id, {});
      setPhotos(photosRes.data.data);
    } catch (error) {
      toast.error('Gallery not found or inactive');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (photoId) => {
    if (event?.downloadsEnabled) {
      window.open(photoAPI.download(photoId), '_blank');
    } else {
      toast.warning(event?.downloadMessage || 'Downloads are currently disabled');
    }
  };

  if (loading) {
    return (
      <div className="gallery-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="gallery-container">
        <div className="card text-center">
          <h2>Gallery Not Found</h2>
          <p>The gallery you're looking for doesn't exist or has been removed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <div className="container">
          <div className="gallery-info">
            <h1>{event.eventName}</h1>
            <p>{format(new Date(event.eventDate), 'MMMM dd, yyyy')}</p>
            {event.photographer && (
              <p className="photographer-name">by {event.photographer.studioName}</p>
            )}
          </div>
          <div className="gallery-stats">
            <span><FaImages /> {event.totalPhotos} Photos</span>
            {!event.downloadsEnabled && (
              <span className="download-locked">
                <FaLock /> Downloads Locked
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        {photos.length > 0 ? (
          <div className="gallery-grid">
            {photos.map((photo) => (
              <div key={photo._id} className="gallery-item">
                <div className="gallery-image">
                  <img
                    src={getImageUrl(photo)}
                    alt={photo.originalName}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Photo';
                    }}
                  />
                  <div className="gallery-overlay">
                    <button
                      className="download-btn"
                      onClick={() => handleDownload(photo._id)}
                      title={event.downloadsEnabled ? 'Download' : 'Downloads are locked'}
                    >
                      <FaDownload />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FaImages className="empty-icon" />
            <h3>No Photos Yet</h3>
            <p>Photos will appear here once they are uploaded</p>
          </div>
        )}
      </div>

      {event.photographer && (
        <footer className="gallery-footer">
          <div className="container">
            <p>Powered by {event.photographer.studioName}</p>
            {event.photographer.website && (
              <a href={event.photographer.website} target="_blank" rel="noopener noreferrer">
                Visit Website
              </a>
            )}
          </div>
        </footer>
      )}
    </div>
  );
};

export default GuestGallery;
