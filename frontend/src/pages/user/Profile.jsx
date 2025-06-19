import React from 'react';
import { FiEdit, FiUser, FiMail, FiCalendar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/pages/Profile.css'; // We will create this file next

const Profile = () => {
  const { currentUser } = useAuth();

  // Placeholder data - replace with real data from your backend
  const userStats = {
    projects: 12,
    applications: 45,
    lastActive: 'Today',
  };

  const getJoinDate = () => {
    if (currentUser?.metadata?.creationTime) {
      return new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return 'N/A';
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-card-header">
          <div className="profile-avatar-wrapper">
            {currentUser?.profileImage?.url ? (
              <img src={currentUser.profileImage.url} alt="Profile" className="profile-avatar" />
            ) : (
              <div className="profile-default-avatar">
                {currentUser?.displayName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div className="profile-info-main">
            <h1 className="profile-name">{currentUser?.displayName || 'Anonymous User'}</h1>
            <p className="profile-email">{currentUser?.email}</p>
          </div>
          <Link to="/profile/edit" className="edit-profile-btn">
            <FiEdit />
            <span>Edit Profile</span>
          </Link>
        </div>
        <div className="profile-stats">
          <div className="stat-item">
            <h3>{userStats.projects}</h3>
            <p>Projects</p>
          </div>
          <div className="stat-item">
            <h3>{userStats.applications}</h3>
            <p>Applications Tracked</p>
          </div>
          <div className="stat-item">
            <h3>{userStats.lastActive}</h3>
            <p>Last Active</p>
          </div>
        </div>
      </div>

      <div className="profile-details-section">
        <h2>Profile Information</h2>
        <ul>
          <li>
            <FiUser className="detail-icon" />
            <strong>Full Name:</strong>
            <span>{currentUser?.displayName || 'Not set'}</span>
          </li>
          <li>
            <FiMail className="detail-icon" />
            <strong>Email Address:</strong>
            <span>{currentUser?.email}</span>
          </li>
          <li>
            <FiCalendar className="detail-icon" />
            <strong>Joined On:</strong>
            <span>{getJoinDate()}</span>
          </li>
        </ul>
      </div>
       <div className="profile-details-section">
        <h2>Account Security</h2>
        <p className="security-note">
            For security, you can change your password or manage other security settings from the main settings page.
        </p>
        <Link to="/settings" className="go-to-settings-btn">
            Go to Settings
        </Link>
       </div>
    </div>
  );
};

export default Profile;