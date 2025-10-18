import React, { useState, useEffect } from 'react';
import { getSMTPSettings, saveSMTPSettings, testSMTPSettings } from '../services/api';
import './SMTPSettings.css';

function SMTPSettings() {
  const [settings, setSettings] = useState({
    host: '',
    port: 587,
    secure: false,
    user: '',
    pass: '',
    alertEmailTo: '',
    alertEmailFrom: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getSMTPSettings();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      ////console.error('Error loading SMTP settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    
    if (!settings.host || !settings.user || !settings.alertEmailTo) {
      setMessage('Please fill in all required fields');
      setMessageType('error');
      return;
    }
    
    setSaving(true);
    try {
      const data = await saveSMTPSettings(settings);
      
      if (data.success) {
        setMessage('✅ SMTP settings saved successfully!');
        setMessageType('success');
        loadSettings();
      } else {
        setMessage('❌ ' + (data.error || 'Failed to save settings'));
        setMessageType('error');
      }
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.error || 'Server error'));
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setMessage('');
    setMessageType('');
    
    if (!testEmail) {
      setMessage('Please enter a test email address');
      setMessageType('error');
      return;
    }
    
    setTesting(true);
    try {
      const testConfig = {
        ...settings,
        to: testEmail
      };
      
      const data = await testSMTPSettings(testConfig);
      
      if (data.success) {
        setMessage('✅ Test email sent successfully! Check your inbox.');
        setMessageType('success');
      } else {
        setMessage('❌ ' + (data.error || 'Failed to send test email'));
        setMessageType('error');
      }
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.error || 'Server error'));
      setMessageType('error');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card page-card">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-title-section">
            <h2>📧 Email & SMTP Settings</h2>
            <p className="page-subtitle">Configure email alerts and SMTP server for security notifications</p>
          </div>
        </div>

        {/* SMTP Form Section */}
        <div className="section-card">
        <h2>📧 Email & SMTP Configuration</h2>
        <p className="description">
          Configure email settings to receive alerts when unauthorized unlock attempts are detected.
        </p>

        <form onSubmit={handleSave} className="smtp-form">
          <div className="form-section">
            <h3>SMTP Server Settings</h3>
            
            <div className="form-group">
              <label>SMTP Host *</label>
              <input
                type="text"
                name="host"
                value={settings.host}
                onChange={handleChange}
                placeholder="smtp.gmail.com"
                required
              />
              <small>Your email provider's SMTP server address</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Port *</label>
                <input
                  type="number"
                  name="port"
                  value={settings.port}
                  onChange={handleChange}
                  required
                />
                <small>Usually 587 (TLS) or 465 (SSL)</small>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="secure"
                    checked={settings.secure}
                    onChange={handleChange}
                  />
                  Use SSL/TLS
                </label>
                <small>Enable for port 465</small>
              </div>
            </div>

            <div className="form-group">
              <label>SMTP Username *</label>
              <input
                type="text"
                name="user"
                value={settings.user}
                onChange={handleChange}
                placeholder="your-email@gmail.com"
                required
              />
              <small>Your email address or SMTP username</small>
            </div>

            <div className="form-group">
              <label>SMTP Password *</label>
              <input
                type="password"
                name="pass"
                value={settings.pass}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              <small>For Gmail, use an App Password (not your regular password)</small>
            </div>
          </div>

          <div className="form-section">
            <h3>Alert Email Addresses</h3>
            
            <div className="form-group">
              <label>Send Alerts To *</label>
              <input
                type="email"
                name="alertEmailTo"
                value={settings.alertEmailTo}
                onChange={handleChange}
                placeholder="admin@example.com"
                required
              />
              <small>Email address to receive security alerts</small>
            </div>

            <div className="form-group">
              <label>From Address</label>
              <input
                type="text"
                name="alertEmailFrom"
                value={settings.alertEmailFrom}
                onChange={handleChange}
                placeholder="VenkatSecurity <noreply@venkatsecurity.com>"
              />
              <small>Display name and email for sent alerts</small>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Settings'}
            </button>
          </div>

          {message && (
            <div className={`message ${messageType === 'success' ? 'success-message' : 'error-message'}`}>
              {message}
            </div>
          )}
        </form>
      </div>

        {/* Test Email Section */}
        <div className="section-card test-section">
        <h3>🧪 Test Email Configuration</h3>
        <p className="description">
          Send a test email to verify your SMTP settings are working correctly.
        </p>

        <div className="test-form">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="test@example.com"
          />
          <button 
            onClick={handleTest} 
            className="btn btn-secondary"
            disabled={testing}
          >
            {testing ? 'Sending...' : '📨 Send Test Email'}
          </button>
        </div>
      </div>

        {/* SMTP Provider Examples */}
        <div className="section-card">
        <h3>📋 Common SMTP Providers</h3>
        <div className="providers-grid">
          <div className="provider">
            <h4>Gmail</h4>
            <p><strong>Host:</strong> smtp.gmail.com</p>
            <p><strong>Port:</strong> 587</p>
            <p><strong>SSL:</strong> No (Use TLS)</p>
            <small>Note: You need to create an App Password in Google Account settings</small>
          </div>
          <div className="provider">
            <h4>Outlook / Office 365</h4>
            <p><strong>Host:</strong> smtp.office365.com</p>
            <p><strong>Port:</strong> 587</p>
            <p><strong>SSL:</strong> No (Use TLS)</p>
          </div>
          <div className="provider">
            <h4>SendGrid</h4>
            <p><strong>Host:</strong> smtp.sendgrid.net</p>
            <p><strong>Port:</strong> 587</p>
            <p><strong>SSL:</strong> No (Use TLS)</p>
          </div>
          <div className="provider">
            <h4>Amazon SES</h4>
            <p><strong>Host:</strong> email-smtp.us-east-1.amazonaws.com</p>
            <p><strong>Port:</strong> 587</p>
            <p><strong>SSL:</strong> No (Use TLS)</p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default SMTPSettings;

