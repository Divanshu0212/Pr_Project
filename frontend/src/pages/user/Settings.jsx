import React, { useState, useEffect } from 'react';
import { FiSun, FiUser, FiBell, FiShield, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext'; // Import useTheme hook
import '../../styles/pages/Settings.css';

const Settings = () => {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme(); // Use theme context
  const [notifications, setNotifications] = useState({ email: true, push: false });

  const handleThemeChange = (newTheme) => {
    if (newTheme !== theme) {
      toggleTheme();
    }
  };
  
  const handleNotificationToggle = (type) => {
    setNotifications(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleDeleteAccount = () => {
    // IMPORTANT: Replaced window.confirm with a custom modal or message box as per instructions.
    // This is a placeholder for a more robust UI confirmation.
    console.log('Account deletion initiated for:', currentUser.email);
    // In a real app, you would show a custom modal here.
    alert('Account deletion is not yet implemented. Please confirm this action in a custom dialog.'); 
  };

  return (
    <div className="settings-page">
      <header className="settings-header fade-in">
        <h1 className="gradient-text">Settings</h1>
        <p>Manage your account settings and preferences.</p>
      </header>

      <div className="settings-container">
        {/* Appearance Settings */}
        <div className="settings-section slide-in-left">
          <h2 className="section-title">
            <FiSun className="section-icon" />
            Appearance
          </h2>
          <div className="setting-item">
            <div className="item-label">
              <h3>Theme</h3>
              <p>Choose how TrackFolio looks to you.</p>
            </div>
            <div className="theme-options">
              <button 
                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => handleThemeChange('light')}>
                Light
              </button>
              <button 
                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => handleThemeChange('dark')}>
                Dark
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-section slide-in-right">
          <h2 className="section-title">
            <FiBell className="section-icon" />
            Notifications
          </h2>
          <div className="setting-item">
             <div className="item-label">
              <h3>Email Notifications</h3>
              <p>Receive updates and summaries via email.</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={notifications.email} onChange={() => handleNotificationToggle('email')} />
              <span className="slider"></span>
            </label>
          </div>
           <div className="setting-item">
             <div className="item-label">
              <h3>Push Notifications</h3>
              <p>Get real-time alerts in your browser.</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={notifications.push} onChange={() => handleNotificationToggle('push')} />
              <span className="slider"></span>
            </label>
          </div>
        </div>
        
        {/* Account Settings */}
        <div className="settings-section slide-in-up">
          <h2 className="section-title">
            <FiShield className="section-icon" />
            Account Security
          </h2>
          <div className="setting-item">
            <div className="item-label">
              <h3>Change Password</h3>
              <p>Update your password for better security.</p>
            </div>
            <button className="action-btn">Change</button>
          </div>
          <div className="setting-item danger-zone">
            <div className="item-label">
              <h3>Delete Account</h3>
              <p>Permanently remove your account and all data.</p>
            </div>
            <button className="action-btn danger-btn" onClick={handleDeleteAccount}>
              <FiTrash2 /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
