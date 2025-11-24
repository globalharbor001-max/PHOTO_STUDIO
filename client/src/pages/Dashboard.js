import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, eventAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaImages, FaCalendarAlt, FaUsers, FaEye, FaDownload, FaPlus } from 'react-icons/fa';
import { format } from 'date-fns';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.name}! 👋</h1>
            <p>{user?.studioName}</p>
          </div>
          <Link to="/events" className="btn btn-primary">
            <FaPlus /> Create New Event
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-primary">
            <div className="stat-icon">
              <FaCalendarAlt />
            </div>
            <div className="stat-content">
              <h3>{stats?.overview?.totalEvents || 0}</h3>
              <p>Total Events</p>
              <span className="stat-badge">{stats?.overview?.activeEvents || 0} Active</span>
            </div>
          </div>

          <div className="stat-card stat-success">
            <div className="stat-icon">
              <FaImages />
            </div>
            <div className="stat-content">
              <h3>{stats?.overview?.totalPhotos || 0}</h3>
              <p>Total Photos</p>
            </div>
          </div>

          <div className="stat-card stat-info">
            <div className="stat-icon">
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3>{stats?.overview?.totalGuests || 0}</h3>
              <p>Total Guests</p>
            </div>
          </div>

          <div className="stat-card stat-warning">
            <div className="stat-icon">
              <FaEye />
            </div>
            <div className="stat-content">
              <h3>{stats?.recentActivity?.views || 0}</h3>
              <p>Views (Last 7 Days)</p>
              <span className="stat-sub">{stats?.recentActivity?.downloads || 0} Downloads</span>
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="card">
          <div className="card-header flex-between">
            <h2>Recent Events</h2>
            <Link to="/events" className="btn btn-sm btn-outline">
              View All
            </Link>
          </div>

          {stats?.recentEvents?.length > 0 ? (
            <div className="events-list">
              {stats.recentEvents.map((event) => (
                <Link
                  key={event._id}
                  to={`/events/${event._id}`}
                  className="event-item"
                >
                  <div className="event-info">
                    <h3>{event.eventName}</h3>
                    <p className="event-client">{event.clientName}</p>
                    <p className="event-date">
                      <FaCalendarAlt /> {format(new Date(event.eventDate), 'MMM dd, yyyy')}
                    </p>
                  </div>

                  <div className="event-stats">
                    <div className="event-stat">
                      <FaImages />
                      <span>{event.totalPhotos} photos</span>
                    </div>
                    <div className="event-stat">
                      <FaEye />
                      <span>{event.totalViews} views</span>
                    </div>
                    <div className="event-stat">
                      <FaDownload />
                      <span>{event.totalDownloads} downloads</span>
                    </div>
                  </div>

                  <div className="event-status">
                    <span className={`badge badge-${event.status === 'active' ? 'success' : 'warning'}`}>
                      {event.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FaCalendarAlt className="empty-icon" />
              <h3>No Events Yet</h3>
              <p>Create your first event to get started</p>
              <Link to="/events" className="btn btn-primary mt-2">
                <FaPlus /> Create Event
              </Link>
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="card tips-card">
          <h3>💡 Quick Tips</h3>
          <ul className="tips-list">
            <li>Create events and upload photos to organize your wedding shoots</li>
            <li>Generate QR codes for easy guest access to their photos</li>
            <li>Tag guests in photos so they can find their pictures instantly</li>
            <li>Control downloads until payment is received</li>
            <li>Add watermarks to protect your work</li>
            <li>Track views and downloads with built-in analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
