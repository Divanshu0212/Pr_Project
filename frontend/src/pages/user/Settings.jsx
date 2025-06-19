import React, { useState, useEffect } from 'react';
// CORRECTED: Replaced FiPalette with FiSun
import { FiSun, FiUser, FiBell, FiShield, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/pages/Settings.css';

const Settings = () => {
  const { currentUser } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [notifications, setNotifications] = useState({ email: true, push: false });

  // Apply theme to the body
  useEffect(() => {
    document.body.className = ''; // Clear existing theme classes
    document.body.classList.add(`${theme}-theme`);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };
  
  const handleNotificationToggle = (type) => {
    setNotifications(prev => ({ ...prev, [type]: !prev[type] }));
    // In a real app, you would save this preference to the backend
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action is irreversible.')) {
      // In a real app, call an API endpoint to delete the user account
      console.log('Account deletion initiated for:', currentUser.email);
    }
  };

  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account settings and preferences.</p>
      </header>

      <div className="settings-container">
        {/* Appearance Settings */}
        <div className="settings-section">
          <h2 className="section-title">
            {/* CORRECTED: Using FiSun here */}
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
        <div className="settings-section">
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
        <div className="settings-section">
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