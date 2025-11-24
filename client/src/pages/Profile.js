import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaUser, FaBuilding, FaEnvelope, FaPhone, FaGlobe, FaLock } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    studioName: user?.studioName || '',
    phone: user?.phone || '',
    website: user?.website || '',
    socialMedia: {
      instagram: user?.socialMedia?.instagram || '',
      facebook: user?.socialMedia?.facebook || '',
      twitter: user?.socialMedia?.twitter || ''
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
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

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(formData);
      updateUser(response.data.data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authAPI.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="container">
        <h1>Profile Settings</h1>
        <p className="profile-subtitle">Manage your account and studio information</p>

        <div className="profile-grid">
          <div className="card">
            <h2>Personal Information</h2>

            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label className="form-label">
                  <FaUser className="input-icon" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaBuilding className="input-icon" />
                  Studio Name
                </label>
                <input
                  type="text"
                  name="studioName"
                  className="form-control"
                  value={formData.studioName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaEnvelope className="input-icon" />
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  value={user?.email}
                  disabled
                />
                <small className="form-text">Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaPhone className="input-icon" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaGlobe className="input-icon" />
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  className="form-control"
                  placeholder="https://yourwebsite.com"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>

              <h3>Social Media</h3>

              <div className="form-group">
                <label className="form-label">Instagram</label>
                <input
                  type="text"
                  name="socialMedia.instagram"
                  className="form-control"
                  placeholder="@yourstudio"
                  value={formData.socialMedia.instagram}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Facebook</label>
                <input
                  type="text"
                  name="socialMedia.facebook"
                  className="form-control"
                  placeholder="facebook.com/yourstudio"
                  value={formData.socialMedia.facebook}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Twitter</label>
                <input
                  type="text"
                  name="socialMedia.twitter"
                  className="form-control"
                  placeholder="@yourstudio"
                  value={formData.socialMedia.twitter}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className="card">
            <h2>Change Password</h2>

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">
                  <FaLock className="input-icon" />
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  className="form-control"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaLock className="input-icon" />
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  className="form-control"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaLock className="input-icon" />
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
