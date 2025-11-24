import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaPlus, FaCalendarAlt, FaQrcode, FaImages, FaEye, FaDownload, FaSearch } from 'react-icons/fa';
import { format } from 'date-fns';
import CreateEventModal from '../components/CreateEventModal';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [filterStatus]);

  const fetchEvents = async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;

      const response = await eventAPI.getAll(params);
      setEvents(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    setShowModal(false);
    fetchEvents();
  };

  const filteredEvents = events.filter(event =>
    event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="events-container">
      <div className="container">
        <div className="events-header">
          <div>
            <h1>Events Management</h1>
            <p>Manage all your wedding and photography events</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FaPlus /> Create New Event
          </button>
        </div>

        <div className="events-filters">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search events by name or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="events-grid">
            {filteredEvents.map((event) => (
              <div key={event._id} className="event-card">
                <div className="event-card-header">
                  <h3>{event.eventName}</h3>
                  <span className={`badge badge-${event.status === 'active' ? 'success' : 'warning'}`}>
                    {event.status}
                  </span>
                </div>

                <div className="event-card-body">
                  <p className="event-client">
                    <strong>Client:</strong> {event.clientName}
                  </p>
                  <p className="event-date">
                    <FaCalendarAlt />
                    {format(new Date(event.eventDate), 'MMMM dd, yyyy')}
                  </p>
                  <p className="event-type">
                    <strong>Type:</strong> {event.eventType}
                  </p>

                  <div className="event-stats-grid">
                    <div className="stat-item">
                      <FaImages />
                      <span>{event.totalPhotos} Photos</span>
                    </div>
                    <div className="stat-item">
                      <FaEye />
                      <span>{event.totalViews} Views</span>
                    </div>
                    <div className="stat-item">
                      <FaDownload />
                      <span>{event.totalDownloads} Downloads</span>
                    </div>
                  </div>

                  <div className="event-access-code">
                    <strong>Access Code:</strong>
                    <code>{event.accessCode}</code>
                  </div>
                </div>

                <div className="event-card-footer">
                  <Link to={`/events/${event._id}`} className="btn btn-sm btn-primary">
                    Manage Event
                  </Link>
                  <span className={`download-status ${event.downloadsEnabled ? 'enabled' : 'disabled'}`}>
                    Downloads {event.downloadsEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FaCalendarAlt className="empty-icon" />
            <h3>No Events Found</h3>
            <p>
              {searchTerm || filterStatus
                ? 'Try adjusting your search or filters'
                : 'Create your first event to get started'}
            </p>
            {!searchTerm && !filterStatus && (
              <button className="btn btn-primary mt-2" onClick={() => setShowModal(true)}>
                <FaPlus /> Create Event
              </button>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <CreateEventModal
          onClose={() => setShowModal(false)}
          onSuccess={handleCreateEvent}
        />
      )}
    </div>
  );
};

export default Events;
