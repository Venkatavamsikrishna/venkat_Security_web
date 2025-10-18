import React, { useState, useEffect } from 'react';
import { getLogs, getStats } from '../services/api';
import StatCard from './StatCard';
import Charts from './Charts';
import LogsTable from './LogsTable';
import PasswordChange from './PasswordChange';
import SMTPSettings from './SMTPSettings';
import AdminProfile from './AdminProfile';
import NotificationBell from './NotificationBell';
import Notifications from './Notifications';
import TOTPAuthenticator from './TOTPAuthenticator';
import EmailLogs from './EmailLogs';
import './Dashboard.css';

function Dashboard({ token, admin, onLogout, onAdminUpdate }) {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, logsData] = await Promise.all([
        getStats(),
        getLogs(100, 0)
      ]);
      
      setStats(statsData.stats);
      setLogs(logsData.logs);
    } catch (error) {
      ////console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>🔐 VenkatSecurity Admin Portal</h1>
          <p>Welcome, {admin?.username}</p>
        </div>
        <div className="header-right">
          <NotificationBell onNotificationClick={() => setActiveTab('notifications')} />
          <button onClick={handleRefresh} className="btn btn-secondary">
            🔄 Refresh
          </button>
          <button onClick={onLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          📋 Logs
        </button>
        <button 
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notifications
        </button>
        <button 
          className={`tab-btn ${activeTab === 'unlock-password' ? 'active' : ''}`}
          onClick={() => setActiveTab('unlock-password')}
        >
          🔑 Unlock Password
        </button>
        <button 
          className={`tab-btn ${activeTab === 'totp' ? 'active' : ''}`}
          onClick={() => setActiveTab('totp')}
        >
          🔐 TOTP Authenticator
        </button>
        <button 
          className={`tab-btn ${activeTab === 'smtp' ? 'active' : ''}`}
          onClick={() => setActiveTab('smtp')}
        >
          📧 Email Settings
        </button>
        <button 
          className={`tab-btn ${activeTab === 'email-logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('email-logs')}
        >
          📨 Email Status
        </button>
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Admin Profile
        </button>
      </div>

      <div className="dashboard-container">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                <div className="stats-grid">
                  <StatCard 
                    icon="📊"
                    title="Total Attempts"
                    value={stats?.totalAttempts || 0}
                    color="#667eea"
                  />
                  <StatCard 
                    icon="✅"
                    title="Successful"
                    value={stats?.successfulAttempts || 0}
                    color="#28a745"
                  />
                  <StatCard 
                    icon="❌"
                    title="Failed"
                    value={stats?.failedAttempts || 0}
                    color="#dc3545"
                  />
                  <StatCard 
                    icon="🖥️"
                    title="Unique Devices"
                    value={stats?.uniqueDevices || 0}
                    color="#ffc107"
                  />
                </div>

                <Charts stats={stats} logs={logs} />
              </>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
              <LogsTable logs={logs} onRefresh={handleRefresh} />
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Notifications onCountChange={(count) => {
                // console.log('Unread:', count)
              }} />
            )}

            {/* Unlock Password Tab */}
            {activeTab === 'unlock-password' && (
              <PasswordChange onPasswordChanged={handleRefresh} />
            )}

            {/* TOTP Authenticator Tab */}
            {activeTab === 'totp' && (
              <TOTPAuthenticator />
            )}

            {/* SMTP Settings Tab */}
            {activeTab === 'smtp' && (
              <SMTPSettings />
            )}

            {/* Email Logs Tab */}
            {activeTab === 'email-logs' && (
              <EmailLogs />
            )}

            {/* Admin Profile Tab */}
            {activeTab === 'profile' && (
              <AdminProfile admin={admin} onUpdate={onAdminUpdate} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
