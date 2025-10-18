import React, { useState, useEffect } from 'react';
import { getTOTPStatus, getCurrentTOTP, setupTOTP, disableTOTP } from '../services/api';
import './TOTPAuthenticator.css';

function TOTPAuthenticator() {
  const [enabled, setEnabled] = useState(false);
  const [currentCode, setCurrentCode] = useState('------');
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showEnableModal, setShowEnableModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadTOTPStatus();
  }, []);

  useEffect(() => {
    if (enabled) {
      loadCurrentCode();
      const interval = setInterval(loadCurrentCode, 1000);
      return () => clearInterval(interval);
    }
  }, [enabled]);

  const loadTOTPStatus = async () => {
    setLoading(true);
    try {
      const data = await getTOTPStatus();
      if (data.success) {
        setEnabled(data.enabled);
      }
    } catch (error) {
      console.error('Error loading TOTP status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentCode = async () => {
    try {
      const data = await getCurrentTOTP();
      if (data.success) {
        setCurrentCode(data.code);
        setTimeRemaining(data.timeRemaining);
      }
    } catch (error) {
      console.error('Error loading current code:', error);
    }
  };

  const handleShowEnableModal = () => {
    setShowEnableModal(true);
    setUnlockPassword('');
  };

  const handleEnableSubmit = async (e) => {
    e.preventDefault();
    setVerifying(true);

    try {
      const data = await setupTOTP(unlockPassword);
      if (data.success) {
        setSetupData(data);
        setShowEnableModal(false);
        setShowSetup(true);
        setUnlockPassword('');
      } else {
        alert(data.error || 'Failed to setup TOTP');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Unlock password is incorrect');
    } finally {
      setVerifying(false);
    }
  };

  const handleConfirmSetup = () => {
    setShowSetup(false);
    setSetupData(null);
    loadTOTPStatus();
  };

  const handleShowDisableModal = () => {
    setShowDisableModal(true);
    setUnlockPassword('');
  };

  const handleDisableSubmit = async (e) => {
    e.preventDefault();
    setVerifying(true);

    try {
      const data = await disableTOTP(unlockPassword);
      if (data.success) {
        setEnabled(false);
        setShowDisableModal(false);
        setUnlockPassword('');
        alert('TOTP authenticator disabled successfully');
        loadTOTPStatus();
      } else {
        alert(data.error || 'Failed to disable TOTP');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Unlock password is incorrect');
    } finally {
      setVerifying(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(currentCode);
    alert('Code copied to clipboard!');
  };

  const getProgressPercentage = () => {
    return (timeRemaining / 60) * 100;
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading authenticator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card page-card">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-title-section">
            <h2>🔐 TOTP Authenticator</h2>
            <p className="page-subtitle">
              {enabled ? 'Time-based one-time passwords for secure access' : 'Enable TOTP for enhanced security'}
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div className="section-card">
        <h2>🔐 TOTP Authenticator</h2>
        <p className="description">
          Time-based One-Time Password - A 6-digit code that changes every minute for secure drive access.
        </p>

        <div className="totp-status">
          <div className="status-row">
            <span className="status-label">Status:</span>
            <span className={`status-value ${enabled ? 'status-enabled' : 'status-disabled'}`}>
              {enabled ? '✅ Enabled' : '⚠️ Disabled'}
            </span>
          </div>
          
          {!enabled && (
            <button className="btn btn-primary" onClick={handleShowEnableModal}>
              🔐 Enable TOTP Authenticator
            </button>
          )}
        </div>
      </div>

        {/* Current Code Display */}
        {enabled && (
          <div className="section-card totp-display-card">
          <h3>🎯 Current TOTP Code</h3>
          <p className="code-description">
            Use this 6-digit code to unlock your drive. Code changes every 60 seconds.
          </p>

          <div className="totp-code-box">
            <div className="code-label">Unlock Code</div>
            <div className="totp-code" onClick={copyCode}>
              {currentCode.split('').map((digit, index) => (
                <span key={index} className="code-digit">{digit}</span>
              ))}
            </div>
            <div className="code-actions">
              <button className="btn-copy-code" onClick={copyCode}>
                📋 Copy Code
              </button>
            </div>
          </div>

          {/* Timer Progress */}
          <div className="timer-container">
            <div className="timer-info">
              <span>⏰ Expires in: <strong>{timeRemaining}s</strong></span>
              <span className="timer-hint">Code refreshes automatically</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${getProgressPercentage()}%`,
                  background: timeRemaining < 10 ? '#dc3545' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              ></div>
            </div>
          </div>

          <div className="totp-actions">
            <button className="btn btn-danger" onClick={handleShowDisableModal}>
              🔓 Disable TOTP
            </button>
          </div>
          </div>
        )}

        {/* How It Works */}
        <div className="section-card">
        <h3>💡 How TOTP Works</h3>
        <div className="info-grid">
          <div className="info-box">
            <div className="info-icon">⏱️</div>
            <h4>Time-Based</h4>
            <p>Code changes every 60 seconds based on current time</p>
          </div>
          <div className="info-box">
            <div className="info-icon">🔢</div>
            <h4>6 Digits</h4>
            <p>Easy to enter, hard to guess (1 in 1 million chance)</p>
          </div>
          <div className="info-box">
            <div className="info-icon">🔒</div>
            <h4>Secure</h4>
            <p>Each code works only once and expires after use</p>
          </div>
          <div className="info-box">
            <div className="info-icon">🌐</div>
            <h4>No Internet</h4>
            <p>Works offline - based on time, not server connection</p>
          </div>
        </div>
      </div>

      {/* Enable TOTP Modal - Password Verification */}
      {showEnableModal && (
        <div className="modal-overlay" onClick={() => setShowEnableModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔐 Enable TOTP Authenticator</h2>
              <button className="modal-close" onClick={() => setShowEnableModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="security-warning">
                <span className="warning-icon">⚠️</span>
                <div>
                  <strong>Security Verification Required</strong>
                  <p>Enter your current unlock password to enable TOTP authenticator.</p>
                </div>
              </div>

              <form onSubmit={handleEnableSubmit} className="verify-form">
                <div className="form-group">
                  <label>Unlock Password *</label>
                  <input
                    type="password"
                    value={unlockPassword}
                    onChange={(e) => setUnlockPassword(e.target.value)}
                    placeholder="Enter current unlock password"
                    autoFocus
                    required
                  />
                  <small>This is the password used in the unlock app</small>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowEnableModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={verifying}
                  >
                    {verifying ? 'Verifying...' : '🔐 Enable TOTP'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Disable TOTP Modal - Password Verification */}
      {showDisableModal && (
        <div className="modal-overlay" onClick={() => setShowDisableModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔓 Disable TOTP Authenticator</h2>
              <button className="modal-close" onClick={() => setShowDisableModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="security-warning">
                <span className="warning-icon">⚠️</span>
                <div>
                  <strong>Security Verification Required</strong>
                  <p>Enter your unlock password to disable TOTP authenticator. After disabling, only regular password will work.</p>
                </div>
              </div>

              <form onSubmit={handleDisableSubmit} className="verify-form">
                <div className="form-group">
                  <label>Unlock Password *</label>
                  <input
                    type="password"
                    value={unlockPassword}
                    onChange={(e) => setUnlockPassword(e.target.value)}
                    placeholder="Enter current unlock password"
                    autoFocus
                    required
                  />
                  <small>This is the password used in the unlock app</small>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowDisableModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-danger" 
                    disabled={verifying}
                  >
                    {verifying ? 'Verifying...' : '🔓 Disable TOTP'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Setup Success Modal */}
      {showSetup && setupData && (
        <div className="modal-overlay" onClick={() => setShowSetup(false)}>
          <div className="modal-content totp-setup-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔐 TOTP Authenticator Setup</h2>
              <button className="modal-close" onClick={() => setShowSetup(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="setup-success">
                <span className="success-icon">✅</span>
                <div>
                  <h3>TOTP Enabled Successfully!</h3>
                  <p>Your VenkatSecurity drive can now be unlocked using TOTP codes.</p>
                </div>
              </div>

              <div className="setup-section">
                <h4>📱 Setup Instructions</h4>
                <ol className="setup-steps">
                  <li><strong>For VenkatSecurity Mobile App:</strong> Copy the secret key below and paste it in the mobile app</li>
                  <li><strong>For Google Authenticator:</strong> Scan the QR code below (optional)</li>
                  <li>Your dashboard and mobile app will show the current code</li>
                  <li>Use the 6-digit code to unlock your drive</li>
                  <li>Code changes every 60 seconds</li>
                </ol>
              </div>

              {setupData.qrCode && (
                <div className="qr-code-section">
                  <h4>📱 Scan QR Code (Optional)</h4>
                  <img src={setupData.qrCode} alt="TOTP QR Code" className="qr-code" />
                  <p className="qr-note">Scan with Google Authenticator, Authy, or similar apps</p>
                </div>
              )}

              <div className="secret-section">
                <h4>🔑 Secret Key (For Mobile App)</h4>
                <div className="secret-box">
                  <code>{setupData.secret}</code>
                  <button 
                    className="btn-copy-secret" 
                    onClick={() => {
                      navigator.clipboard.writeText(setupData.secret);
                      alert('Secret copied! Paste it in the VenkatSecurity Mobile App');
                    }}
                  >
                    📋 Copy for Mobile App
                  </button>
                </div>
                <p className="secret-note">
                  📱 <strong>For Mobile App:</strong> Copy this secret and paste it when the mobile app asks for it
                  <br />
                  🔒 <strong>For Backup:</strong> Save this key in a secure location
                </p>
              </div>

              <div className="alert-info-setup">
                ℹ️ <strong>Three Ways to Use TOTP:</strong>
                <ol style={{ marginTop: '10px', marginLeft: '20px' }}>
                  <li><strong>VenkatSecurity Mobile App</strong> - Use the secret key above</li>
                  <li><strong>This Dashboard</strong> - View current code on this page</li>
                  <li><strong>Google Authenticator</strong> - Scan the QR code (optional)</li>
                </ol>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-primary" onClick={handleConfirmSetup}>
                ✅ Got It!
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default TOTPAuthenticator;

