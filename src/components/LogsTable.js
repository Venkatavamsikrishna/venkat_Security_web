import React, { useState } from 'react';
import './LogsTable.css';

function LogsTable({ logs, onRefresh }) {
  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleLogClick = (log) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLog(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="page-container">
      <div className="card page-card">
        <div className="page-header">
          <div className="page-title-section">
            <h2>📊 Access Logs</h2>
            <p className="page-subtitle">View all unlock attempts with detailed system information</p>
          </div>
          <div className="page-actions">
            <button onClick={onRefresh} className="btn btn-secondary">
              🔄 Refresh
            </button>
          </div>
        </div>
        
        {!logs || logs.length === 0 ? (
          <p className="no-logs">No access attempts logged yet.</p>
        ) : (
          <div className="logs-table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Hostname</th>
                  <th>User</th>
                  <th>Platform</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index} className={log.success ? 'success-row' : 'failed-row'}>
                    <td>
                      <span className={`status-badge ${log.success ? 'status-success' : 'status-failed'}`}>
                        {log.success ? '✅ Success' : '❌ Failed'}
                      </span>
                    </td>
                    <td>{log.sysInfo?.hostname || 'Unknown'}</td>
                    <td>{log.sysInfo?.user || 'Unknown'}</td>
                    <td>
                      {log.sysInfo?.platform || 'Unknown'} {log.sysInfo?.arch || ''}
                    </td>
                    <td>{log.ipAddress || '-'}</td>
                    <td>{formatDate(log.timestamp)}</td>
                    <td>
                      <button 
                        className="btn-view-details" 
                        onClick={() => handleLogClick(log)}
                        title="View full details"
                      >
                        👁️ View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {showModal && selectedLog && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {selectedLog.success ? '✅' : '❌'} 
                {selectedLog.success ? ' Successful Access' : ' Failed Access Attempt'}
              </h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              {/* Status Section */}
              <div className="detail-section">
                <h3>📊 Attempt Status</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`detail-value ${selectedLog.success ? 'success-text' : 'error-text'}`}>
                      {selectedLog.success ? 'Access Granted ✅' : 'Access Denied ❌'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Attempt Type:</span>
                    <span className="detail-value">{selectedLog.attemptType || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Timestamp:</span>
                    <span className="detail-value">{formatDate(selectedLog.timestamp)}</span>
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div className="detail-section">
                <h3>🖥️ System Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Hostname:</span>
                    <span className="detail-value">{selectedLog.sysInfo?.hostname || 'Unknown'}</span>
                    <button 
                      className="btn-copy" 
                      onClick={() => copyToClipboard(selectedLog.sysInfo?.hostname)}
                      title="Copy to clipboard"
                    >
                      📋
                    </button>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Username:</span>
                    <span className="detail-value">{selectedLog.sysInfo?.user || 'Unknown'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Platform:</span>
                    <span className="detail-value">{selectedLog.sysInfo?.platform || 'Unknown'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">OS Release:</span>
                    <span className="detail-value">{selectedLog.sysInfo?.release || 'Unknown'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Architecture:</span>
                    <span className="detail-value">{selectedLog.sysInfo?.arch || 'Unknown'}</span>
                  </div>
                </div>
              </div>

              {/* Network Information */}
              <div className="detail-section">
                <h3>🌐 Network Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">IP Address:</span>
                    <span className="detail-value">{selectedLog.ipAddress || 'Unknown'}</span>
                    <button 
                      className="btn-copy" 
                      onClick={() => copyToClipboard(selectedLog.ipAddress)}
                      title="Copy to clipboard"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="detail-section">
                <h3>ℹ️ Additional Details</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Log ID:</span>
                    <span className="detail-value">{selectedLog._id || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Created At:</span>
                    <span className="detail-value">
                      {selectedLog.createdAt ? formatDate(selectedLog.createdAt) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Raw Data (for debugging) */}
              <details className="raw-data-section">
                <summary>🔍 View Raw JSON Data</summary>
                <pre className="raw-data-content">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => copyToClipboard(JSON.stringify(selectedLog, null, 2))}
                >
                  📋 Copy JSON
                </button>
              </details>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LogsTable;

