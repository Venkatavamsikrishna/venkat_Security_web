import React, { useState, useEffect } from 'react';
import { changeUnlockPassword, verifyOldPassword, getCurrentUnlockPassword, getPasswordHistory, revealCurrentPassword } from '../services/api';
import { showSuccess, showError } from '../utils/toast';
import './PasswordChange.css';

function PasswordChange({ onPasswordChanged }) {
  const [step, setStep] = useState(1); // 1: Verify old, 2: Enter new
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [passwordHistory, setPasswordHistory] = useState([]);
  const [currentPasswordSet, setCurrentPasswordSet] = useState(false);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [revealedPassword, setRevealedPassword] = useState('');
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    loadPasswordInfo();
  }, []);

  const loadPasswordInfo = async () => {
    try {
      const [currentData, historyData] = await Promise.all([
        getCurrentUnlockPassword(),
        getPasswordHistory()
      ]);
      
      if (currentData.success) {
        setCurrentPasswordSet(currentData.passwordSet);
      }
      
      if (historyData.success) {
        setPasswordHistory(historyData.history);
      }
    } catch (error) {
      ////console.error('Error loading password info:', error);
    }
  };

  const handleVerifyOld = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (!oldPassword) {
      setMessage('Please enter your current password');
      setMessageType('error');
      return;
    }

    setVerifying(true);

    try {
      const data = await verifyOldPassword(oldPassword);
      
      if (data.success && data.isValid) {
        setMessage('✅ Password verified! Now enter your new password.');
        setMessageType('success');
        setStep(2);
      } else {
        setMessage('❌ Current password is incorrect');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.error || 'Verification failed'));
      setMessageType('error');
    } finally {
      setVerifying(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    // Validation
    if (!newPassword || !confirmPassword) {
      setMessage('Please fill in both password fields');
      setMessageType('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      setMessageType('error');
      return;
    }

    if (newPassword.length < 8) {
      setMessage('New password must be at least 8 characters');
      setMessageType('error');
      return;
    }

    setLoading(true);

    try {
      const data = await changeUnlockPassword(oldPassword, newPassword);
      
      if (data.success) {
        setMessage('✅ Unlock password changed successfully!');
        setMessageType('success');
        
        // Reset form
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setStep(1);
        
        // Reload password info
        loadPasswordInfo();
        
        if (onPasswordChanged) {
          onPasswordChanged();
        }
      } else {
        setMessage('❌ ' + (data.error || 'Failed to change password'));
        setMessageType('error');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Server error';
      setMessage('❌ ' + errorMsg);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setNewPassword('');
    setConfirmPassword('');
    setMessage('');
    setMessageType('');
  };

  const handleRevealPassword = () => {
    setShowRevealModal(true);
    setAdminPassword('');
    setRevealedPassword('');
  };

  const closeRevealModal = () => {
    setShowRevealModal(false);
    setAdminPassword('');
    setRevealedPassword('');
  };

  const handleRevealSubmit = async (e) => {
    e.preventDefault();
    setRevealing(true);

    try {
      const { revealCurrentPassword } = await import('../services/api');
      const data = await revealCurrentPassword(adminPassword);
      
      if (data.success) {
        setRevealedPassword(data.password);
      } else {
        showError(data.error || 'Failed to reveal password');
      }
    } catch (error) {
      showError(error.response?.data?.error || 'Admin password is incorrect');
    } finally {
      setRevealing(false);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(revealedPassword);
    showSuccess('Password copied to clipboard!');
  };

  return (
    <div className="page-container">
      <div className="card page-card">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-title-section">
            <h2>🔑 Unlock Password Management</h2>
            <p className="page-subtitle">Manage your secure drive unlock password with advanced security features</p>
          </div>
        </div>

        {/* Current Password Status */}
        <div className="section-card">
        <h2>🔐 Current Unlock Password Status</h2>
        <div className="current-password-info">
          <div className="info-row">
            <span className="info-label">Status:</span>
            <span className={`info-value ${currentPasswordSet ? 'active' : 'inactive'}`}>
              {currentPasswordSet ? '✅ Password Set' : '⚠️ No Password Set'}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Current Password:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="info-value password-display">
                {currentPasswordSet ? '•••••••••••••' : 'Not Set'}
              </span>
              {currentPasswordSet && (
                <button 
                  className="btn-reveal"
                  onClick={handleRevealPassword}
                  title="View password (requires admin password)"
                >
                  👁️ Reveal
                </button>
              )}
            </div>
          </div>
          {passwordHistory.length > 0 && passwordHistory[0].isCurrent && (
            <>
              <div className="info-row">
                <span className="info-label">Last Changed:</span>
                <span className="info-value">
                  {new Date(passwordHistory[0].changedAt).toLocaleString()}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Changed By:</span>
                <span className="info-value">{passwordHistory[0].changedBy}</span>
              </div>
            </>
          )}
        </div>
      </div>

        {/* Change Password Form */}
        <div className="section-card">
        <h2>🔑 Change Unlock Password</h2>
        <p className="description">
          Change the password that pendrive users need to unlock the secure drive.
        </p>

        {/* Step Indicator */}
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Verify Current</span>
          </div>
          <div className="step-divider"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Set New Password</span>
          </div>
        </div>

        {/* Step 1: Verify Old Password */}
        {step === 1 && (
          <form onSubmit={handleVerifyOld} className="password-form">
            <div className="form-group">
              <label>Current Password *</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current unlock password"
                disabled={verifying}
                required
              />
              <small>Enter the current password to proceed</small>
            </div>

            <button type="submit" className="btn btn-primary" disabled={verifying}>
              {verifying ? <span className="spinner"></span> : 'Verify & Continue →'}
            </button>

            {message && (
              <p className={`message ${messageType === 'success' ? 'success-message' : 'error-message'}`}>
                {message}
              </p>
            )}
          </form>
        )}

        {/* Step 2: Enter New Password */}
        {step === 2 && (
          <form onSubmit={handleChangePassword} className="password-form">
            <div className="alert-info">
              ℹ️ Your new password cannot be the same as any previous password.
            </div>

            <div className="form-group">
              <label>New Password *</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 characters)"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                disabled={loading}
                required
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={handleBack}>
                ← Back
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner"></span> : '🔐 Change Password'}
              </button>
            </div>

            {message && (
              <p className={`message ${messageType === 'success' ? 'success-message' : 'error-message'}`}>
                {message}
              </p>
            )}
          </form>
        )}
      </div>

        {/* Password History */}
        <div className="section-card">
        <h2>📜 Password Change History</h2>
        <p className="description">
          View all previous password changes. Old passwords cannot be reused for security.
        </p>

        {passwordHistory.length === 0 ? (
          <p className="no-history">No password history available.</p>
        ) : (
          <div className="history-list">
            {passwordHistory.map((item, index) => (
              <div key={item.id} className={`history-item ${item.isCurrent ? 'current' : ''}`}>
                <div className="history-icon">
                  {item.isCurrent ? '🔐' : '🔒'}
                </div>
                <div className="history-details">
                  <div className="history-main">
                    <span className="history-password">{item.passwordHash}</span>
                    {item.isCurrent && (
                      <span className="current-badge">Current</span>
                    )}
                  </div>
                  <div className="history-meta">
                    <span>Changed by: {item.changedBy}</span>
                    <span>•</span>
                    <span>{new Date(item.changedAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="history-number">#{passwordHistory.length - index}</div>
              </div>
            ))}
          </div>
        )}

        <div className="history-note">
          <strong>🔒 Security Note:</strong> All {passwordHistory.length} password(s) in history cannot be reused.
          Choose a unique password that hasn't been used before.
        </div>
      </div>

      {/* Reveal Password Modal */}
      {showRevealModal && (
        <div className="modal-overlay" onClick={closeRevealModal}>
          <div className="modal-content reveal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔓 Reveal Current Password</h2>
              <button className="modal-close" onClick={closeRevealModal}>✕</button>
            </div>

            <div className="modal-body">
              {!revealedPassword ? (
                <>
                  <div className="security-warning">
                    <span className="warning-icon">⚠️</span>
                    <div>
                      <strong>Security Verification Required</strong>
                      <p>Enter your admin password to view the current unlock password.</p>
                    </div>
                  </div>

                  <form onSubmit={handleRevealSubmit} className="reveal-form">
                    <div className="form-group">
                      <label>Admin Password *</label>
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Enter your admin password"
                        autoFocus
                        required
                      />
                      <small>This is your dashboard login password</small>
                    </div>

                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={closeRevealModal}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={revealing}
                      >
                        {revealing ? 'Verifying...' : '🔓 Reveal Password'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <div className="revealed-password-section">
                    <h3>🔓 Current Unlock Password</h3>
                    <p className="password-note">
                      ℹ️ This is the current password used to unlock the secure drive from the pendrive app.
                    </p>
                    
                    <div className="password-display-box">
                      <div className="password-label">Unlock Password:</div>
                      <div className="password-value">{revealedPassword}</div>
                      <button className="btn-copy-password" onClick={copyPassword}>
                        📋 Copy Password
                      </button>
                    </div>

                    <div className="password-info">
                      <div className="info-alert">
                        <strong>⚠️ Keep This Secure!</strong>
                        <p>This password unlocks your encrypted drive. Do not share it with unauthorized persons.</p>
                      </div>
                      
                      <div className="info-tips">
                        <p><strong>💡 Tips:</strong></p>
                        <ul>
                          <li>Write it down in a secure location</li>
                          <li>Use a password manager</li>
                          <li>Change it regularly</li>
                          <li>Don't reuse old passwords</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={closeRevealModal}>
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default PasswordChange;
