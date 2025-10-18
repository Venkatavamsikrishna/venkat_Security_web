import React, { useState, useEffect } from 'react';
import { getEmailLogs, getEmailStats, retryEmail, clearOldEmailLogs } from '../services/api';
import { showSuccess, showError, showWarning } from '../utils/toast';
import './EmailLogs.css';

function EmailLogs() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, sent, failed, sending, bounced
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? '' : filter;
      const [logsData, statsData] = await Promise.all([
        getEmailLogs(100, 0, status),
        getEmailStats()
      ]);
      
      setLogs(logsData.logs);
      setStats(statsData.stats);
    } catch (error) {
      // console.error('Error fetching email logs:', error);
      showError('Failed to load email logs');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (id) => {
    try {
      const data = await retryEmail(id);
      if (data.success) {
        showSuccess('Email retry initiated');
        fetchData();
      } else {
        showError(data.error || 'Failed to retry email');
      }
    } catch (error) {
      showError('Error retrying email');
    }
  };

  const handleClearOld = async () => {
    if (window.confirm('Clear email logs older than 30 days?')) {
      try {
        const data = await clearOldEmailLogs(30);
        if (data.success) {
          showSuccess(`Deleted ${data.deletedCount} old email logs`);
          fetchData();
        } else {
          showError('Failed to clear logs');
        }
      } catch (error) {
        showError('Error clearing logs');
      }
    }
  };

  const handleRowClick = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      sending: { class: 'status-sending', icon: '⏳', text: 'Sending' },
      sent: { class: 'status-sent', icon: '✅', text: 'Sent' },
      failed: { class: 'status-failed', icon: '❌', text: 'Failed' },
      bounced: { class: 'status-bounced', icon: '⚠️', text: 'Bounced' }
    };
    const badge = badges[status] || badges.sending;
    return <span className={`status-badge ${badge.class}`}>{badge.icon} {badge.text}</span>;
  };

  const getTypeName = (type) => {
    const types = {
      unlock_failed: '🚨 Failed Unlock',
      unlock_success: '✅ Successful Unlock',
      password_changed: '🔑 Password Changed',
      admin_login: '🔓 Admin Login',
      smtp_changed: '📧 SMTP Updated',
      totp_enabled: '🔐 TOTP Enabled',
      totp_disabled: '🔓 TOTP Disabled',
      password_revealed: '👁️ Password Revealed',
      test_email: '🧪 Test Email',
      notification: '🔔 Notification'
    };
    return types[type] || type;
  };

  return (
    <div className="page-container">
      <div className="card page-card">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-title-section">
            <h2>📧 Email Logs & Status</h2>
            <p className="page-subtitle">Track all email notifications sent by the system</p>
          </div>
          <div className="page-actions">
            <button onClick={fetchData} className="btn btn-secondary">
              🔄 Refresh
            </button>
            <button onClick={handleClearOld} className="btn btn-danger">
              🗑️ Clear Old Logs
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="email-stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#667eea' }}>📊</div>
              <div className="stat-details">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Emails</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#28a745' }}>✅</div>
              <div className="stat-details">
                <div className="stat-value">{stats.sent}</div>
                <div className="stat-label">Sent Successfully</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#dc3545' }}>❌</div>
              <div className="stat-details">
                <div className="stat-value">{stats.failed}</div>
                <div className="stat-label">Failed</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#ffc107' }}>⏳</div>
              <div className="stat-details">
                <div className="stat-value">{stats.sending}</div>
                <div className="stat-label">In Progress</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#17a2b8' }}>📈</div>
              <div className="stat-details">
                <div className="stat-value">{stats.successRate}%</div>
                <div className="stat-label">Success Rate</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#6c757d' }}>📧</div>
              <div className="stat-details">
                <div className="stat-value">{stats.sent24h}</div>
                <div className="stat-label">Sent (24h)</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="page-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            📊 All ({stats?.total || 0})
          </button>
          <button 
            className={`filter-btn ${filter === 'sent' ? 'active' : ''}`}
            onClick={() => setFilter('sent')}
          >
            ✅ Sent ({stats?.sent || 0})
          </button>
          <button 
            className={`filter-btn ${filter === 'failed' ? 'active' : ''}`}
            onClick={() => setFilter('failed')}
          >
            ❌ Failed ({stats?.failed || 0})
          </button>
          <button 
            className={`filter-btn ${filter === 'sending' ? 'active' : ''}`}
            onClick={() => setFilter('sending')}
          >
            ⏳ Sending ({stats?.sending || 0})
          </button>
          <button 
            className={`filter-btn ${filter === 'bounced' ? 'active' : ''}`}
            onClick={() => setFilter('bounced')}
          >
            ⚠️ Bounced ({stats?.bounced || 0})
          </button>
        </div>

        {/* Email Logs Table */}
        <div className="section-card">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading email logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="no-data">
              <div className="no-data-icon">📭</div>
              <h3>No Email Logs Found</h3>
              <p>No emails match the selected filter</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Type</th>
                    <th>To</th>
                    <th>Subject</th>
                    <th>Sent At</th>
                    <th>Retry</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr 
                      key={log._id} 
                      onClick={() => handleRowClick(log)}
                      className="clickable-row"
                    >
                      <td>{getStatusBadge(log.status)}</td>
                      <td>
                        <span className="email-type">{getTypeName(log.type)}</span>
                      </td>
                      <td>{log.to}</td>
                      <td className="subject-cell">{log.subject}</td>
                      <td>
                        {log.sentAt 
                          ? new Date(log.sentAt).toLocaleString()
                          : new Date(log.createdAt).toLocaleString()
                        }
                      </td>
                      <td>
                        <span className="retry-count">{log.retryCount}</span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        {log.status === 'failed' && (
                          <button 
                            className="btn-retry"
                            onClick={() => handleRetry(log._id)}
                          >
                            🔄 Retry
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content email-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📧 Email Details</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Status</h3>
                <div className="detail-row">
                  {getStatusBadge(selectedLog.status)}
                </div>
              </div>

              <div className="detail-section">
                <h3>Email Information</h3>
                <div className="detail-row">
                  <span className="detail-label">From:</span>
                  <span className="detail-value">{selectedLog.from}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">To:</span>
                  <span className="detail-value">{selectedLog.to}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Subject:</span>
                  <span className="detail-value">{selectedLog.subject}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{getTypeName(selectedLog.type)}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Timestamps</h3>
                <div className="detail-row">
                  <span className="detail-label">Created:</span>
                  <span className="detail-value">{new Date(selectedLog.createdAt).toLocaleString()}</span>
                </div>
                {selectedLog.sentAt && (
                  <div className="detail-row">
                    <span className="detail-label">Sent:</span>
                    <span className="detail-value">{new Date(selectedLog.sentAt).toLocaleString()}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">Updated:</span>
                  <span className="detail-value">{new Date(selectedLog.updatedAt).toLocaleString()}</span>
                </div>
              </div>

              {selectedLog.messageId && (
                <div className="detail-section">
                  <h3>Message ID</h3>
                  <div className="detail-row">
                    <code>{selectedLog.messageId}</code>
                  </div>
                </div>
              )}

              {selectedLog.error && (
                <div className="detail-section">
                  <h3>Error Details</h3>
                  <div className="error-box">
                    {selectedLog.error}
                  </div>
                </div>
              )}

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div className="detail-section">
                  <h3>Metadata</h3>
                  <pre className="metadata-box">{JSON.stringify(selectedLog.metadata, null, 2)}</pre>
                </div>
              )}

              <div className="detail-section">
                <h3>Additional Info</h3>
                <div className="detail-row">
                  <span className="detail-label">Retry Count:</span>
                  <span className="detail-value">{selectedLog.retryCount}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {selectedLog.status === 'failed' && (
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    handleRetry(selectedLog._id);
                    setShowDetailModal(false);
                  }}
                >
                  🔄 Retry Email
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmailLogs;

