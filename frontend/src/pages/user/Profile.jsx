import React from 'react';
import { 
  FiEdit, 
  FiUser, 
  FiMail, 
  FiCalendar, 
  FiTrendingUp, 
  FiActivity, 
  FiClock,
  FiSettings,
  FiShield
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/pages/Profile.css';
import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/common/Card'; // Ensure Card component is imported

const Profile = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  // Enhanced placeholder data - replace with real data from your backend
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
    return 'Not available';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="profile-page">
      <div className="profile-hero-section">
        <div className="profile-hero-bg"></div>
        <div className="profile-hero-content">
          {/* Main Profile Card */}
          <Card className="profile-glass-card animate-slide-up">
            <div className="profile-card-header">
              <div className="profile-avatar-wrapper">
                {currentUser?.profileImage?.url ? (
                  <img 
                    src={currentUser.profileImage.url} 
                    alt="Profile" 
                    className="profile-avatar" 
                  />
                ) : (
                  <div className="profile-default-avatar">
                    <span className="avatar-text">
                      {getInitials(currentUser?.displayName)}
                    </span>
                  </div>
                )}
                <div className="avatar-status-indicator" title="Active now"></div>
              </div>
              
              <div className="profile-info-main">
                <h1 className="profile-name gradient-text">
                  {currentUser?.displayName || 'Anonymous User'}
                </h1>
                <p className="profile-email">
                  {currentUser?.email || 'No email provided'}
                </p>
                <div className="profile-badge">
                  <span className="badge-text">✨ Active Member</span>
                </div>
              </div>
              
              <Link to="/profile/edit" className="edit-profile-btn">
                <FiEdit size={18} />
                <span>Edit Profile</span>
              </Link>
            </div>
          </Card>

          {/* User Stats Card */}
          <Card className="profile-glass-card animate-slide-up delay-1">
            <div className="profile-stats">
              <div className="stat-item">
                <div className="stat-icon">
                  <FiTrendingUp />
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{userStats.projects}</h3>
                  <p className="stat-label">Projects</p>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">
                  <FiActivity />
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{userStats.applications}</h3>
                  <p className="stat-label">Applications</p>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">
                  <FiClock />
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{userStats.lastActive}</h3>
                  <p className="stat-label">Last Active</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Profile Details and Security Sections Grid */}
      <div className="profile-content-grid">
        {/* Profile Information Card */}
        <Card className="profile-glass-card animate-slide-up delay-2">
          <h2 className="section-title">
            <span className="gradient-text">Profile Information</span>
          </h2>
          <div className="details-list">
            <div className="detail-item">
              <div className="detail-icon-wrapper">
                <FiUser className="detail-icon" />
              </div>
              <div className="detail-content">
                <strong>Full Name</strong>
                <span>{currentUser?.displayName || 'Not set'}</span>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-icon-wrapper">
                <FiMail className="detail-icon" />
              </div>
              <div className="detail-content">
                <strong>Email Address</strong>
                <span>{currentUser?.email || 'Not provided'}</span>
              </div>
            </div>
            <div className="detail-item">
              <div className="detail-icon-wrapper">
                <FiCalendar className="detail-icon" />
              </div>
              <div className="detail-content">
                <strong>Member Since</strong>
                <span>{getJoinDate()}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Account Security Card */}
        <Card className="profile-glass-card animate-slide-up delay-3">
          <h2 className="section-title">
            <span className="gradient-text">Account Security</span>
          </h2>
          <div className="security-content">
            <div className="detail-item" /* Removed inline style, rely on gap */>
              <div className="detail-icon-wrapper">
                <FiShield className="detail-icon" />
              </div>
              <div className="detail-content">
                <strong>Account Status</strong>
                <span>Verified & Secure</span>
              </div>
            </div>
            <p className="security-note">
              Manage your account security, password, and privacy settings to keep your profile safe and secure.
            </p>
            <Link to="/settings" className="go-to-settings-btn">
              <FiSettings size={18} />
              <span>Go to Settings</span>
              <div className="btn-glow"></div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
