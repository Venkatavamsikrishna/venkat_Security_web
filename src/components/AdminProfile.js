import React, { useState, useEffect } from 'react';
import { getAdminProfile, changeAdminPassword, updateAdminProfile } from '../services/api';
import './AdminProfile.css';

function AdminProfile({ admin, onUpdate }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Username change
  const [newUsername, setNewUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [usernameMessageType, setUsernameMessageType] = useState('');
  const [updatingUsername, setUpdatingUsername] = useState(false);
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordMessageType, setPasswordMessageType] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getAdminProfile();
      if (data.success) {
        setProfile(data.admin);
        setNewUsername(data.admin.username);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameUpdate = async (e) => {
    e.preventDefault();
    setUsernameMessage('');
    setUsernameMessageType('');
    
    if (!newUsername) {
      setUsernameMessage('Username cannot be empty');
      setUsernameMessageType('error');
      return;
    }
    
    if (newUsername === profile.username) {
      setUsernameMessage('Please enter a different username');
      setUsernameMessageType('error');
      return;
    }
    
    setUpdatingUsername(true);
    try {
      const data = await updateAdminProfile(newUsername);
      
      if (data.success) {
        setUsernameMessage('✅ Username updated successfully!');
        setUsernameMessageType('success');
        
        // Update token and admin data
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('admin', JSON.stringify(data.admin));
          if (onUpdate) {
            onUpdate(data.token, data.admin);
          }
        }
        
        loadProfile();
      } else {
        setUsernameMessage('❌ ' + (data.error || 'Failed to update username'));
        setUsernameMessageType('error');
      }
    } catch (error) {
      setUsernameMessage('❌ ' + (error.response?.data?.error || 'Server error'));
      setUsernameMessageType('error');
    } finally {
      setUpdatingUsername(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordMessageType('');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage('Please fill in all password fields');
      setPasswordMessageType('error');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordMessage('New passwords do not match');
      setPasswordMessageType('error');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordMessage('New password must be at least 8 characters');
      setPasswordMessageType('error');
      return;
    }
    
    setChangingPassword(true);
    try {
      const data = await changeAdminPassword(currentPassword, newPassword);
      
      if (data.success) {
        setPasswordMessage('✅ Password changed successfully!');
        setPasswordMessageType('success');
        
        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordMessage('❌ ' + (data.error || 'Failed to change password'));
        setPasswordMessageType('error');
      }
    } catch (error) {
      setPasswordMessage('❌ ' + (error.response?.data?.error || 'Server error'));
      setPasswordMessageType('error');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card page-card">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-title-section">
            <h2>👤 Admin Profile</h2>
            <p className="page-subtitle">Manage your admin account settings and security</p>
          </div>
        </div>

        {/* Profile Info */}
        <div className="section-card">
        <h2>👤 Admin Profile Information</h2>
        <div className="profile-info">
          <div className="info-item">
            <label>Username</label>
            <span>{profile?.username}</span>
          </div>
          <div className="info-item">
            <label>Last Login</label>
            <span>{profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Never'}</span>
          </div>
          <div className="info-item">
            <label>Account Created</label>
            <span>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}</span>
          </div>
        </div>
      </div>

        {/* Change Username */}
        <div className="section-card">
        <h3>📝 Change Username</h3>
        <form onSubmit={handleUsernameUpdate} className="profile-form">
          <div className="form-group">
            <label>New Username</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter new username"
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={updatingUsername}>
            {updatingUsername ? 'Updating...' : '💾 Update Username'}
          </button>
          
          {usernameMessage && (
            <div className={`message ${usernameMessageType === 'success' ? 'success-message' : 'error-message'}`}>
              {usernameMessage}
            </div>
          )}
        </form>
      </div>

        {/* Change Password */}
        <div className="section-card">
        <h3>🔒 Change Admin Password</h3>
        <p className="description">
          Change your password to access this admin dashboard. This is different from the unlock password.
        </p>
        
        <form onSubmit={handlePasswordChange} className="profile-form">
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 8 characters)"
            />
          </div>
          
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={changingPassword}>
            {changingPassword ? 'Changing...' : '🔑 Change Password'}
          </button>
          
          {passwordMessage && (
            <div className={`message ${passwordMessageType === 'success' ? 'success-message' : 'error-message'}`}>
              {passwordMessage}
            </div>
          )}
        </form>
      </div>

        {/* Recent Login Attempts */}
        {profile?.loginAttempts && profile.loginAttempts.length > 0 && (
          <div className="section-card">
          <h3>🔍 Recent Login Attempts</h3>
          <div className="login-attempts">
            {profile.loginAttempts.slice().reverse().map((attempt, index) => (
              <div key={index} className={`attempt-item ${attempt.success ? 'success' : 'failed'}`}>
                <div className="attempt-status">
                  {attempt.success ? '✅ Success' : '❌ Failed'}
                </div>
                <div className="attempt-details">
                  <span>{new Date(attempt.timestamp).toLocaleString()}</span>
                  <span>IP: {attempt.ipAddress || 'Unknown'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

export default AdminProfile;

