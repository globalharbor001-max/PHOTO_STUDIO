import React, { useState } from 'react';
import { eventAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';
import './Modal.css';

const CreateEventModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    eventName: '',
    clientName: '',
    eventDate: '',
    eventType: 'wedding',
    galleryType: 'public',
    location: {
      venue: '',
      city: '',
      state: ''
    },
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await eventAPI.create(formData);
      toast.success('Event created successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Event</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Event Name *</label>
            <input
              type="text"
              name="eventName"
              className="form-control"
              placeholder="e.g., John & Jane Wedding"
              value={formData.eventName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Client Name *</label>
            <input
              type="text"
              name="clientName"
              className="form-control"
              placeholder="e.g., John Doe"
              value={formData.clientName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Event Date *</label>
              <input
                type="date"
                name="eventDate"
                className="form-control"
                value={formData.eventDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Event Type *</label>
              <select
                name="eventType"
                className="form-control"
                value={formData.eventType}
                onChange={handleChange}
              >
                <option value="wedding">Wedding</option>
                <option value="pre-wedding">Pre-Wedding</option>
                <option value="engagement">Engagement</option>
                <option value="reception">Reception</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Gallery Type *</label>
            <select
              name="galleryType"
              className="form-control"
              value={formData.galleryType}
              onChange={handleChange}
            >
              <option value="public">Public (Guests see only their tagged photos)</option>
              <option value="private">Private (Guests see all photos)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Venue</label>
            <input
              type="text"
              name="location.venue"
              className="form-control"
              placeholder="Wedding venue name"
              value={formData.location.venue}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                name="location.city"
                className="form-control"
                placeholder="City"
                value={formData.location.city}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                name="location.state"
                className="form-control"
                placeholder="State"
                value={formData.location.state}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              name="notes"
              className="form-control"
              placeholder="Additional notes or instructions..."
              value={formData.notes}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
