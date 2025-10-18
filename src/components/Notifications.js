import React, { useState, useEffect } from 'react';
import { getNotifications, markNotificationsRead, markAllNotificationsRead, deleteNotification, clearAllNotifications } from '../services/api';
import './Notifications.css';

function Notifications({ onCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // all, unread

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications(100, 0, filter === 'unread');
      
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
        
        if (onCountChange) {
          onCountChange(data.unreadCount);
        }
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationsRead([notificationId]);
      loadNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }
    
    try {
      await deleteNotification(notificationId);
      loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications? This cannot be undone.')) {
      return;
    }
    
    try {
      await clearAllNotifications();
      loadNotifications();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      unlock_success: '✅',
      unlock_failed: '❌',
      password_changed: '🔑',
      admin_login: '🔓',
      smtp_changed: '📧',
      settings_updated: '⚙️',
      admin_password_changed: '🔒',
      password_revealed: '👁️'
    };
    return icons[type] || '📌';
  };

  const getSeverityClass = (severity) => {
    return `notification-${severity}`;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return notifDate.toLocaleDateString();
  };

  return (
    <div className="page-container">
      <div className="card page-card">
        <div className="page-header">
          <div className="page-title-section">
            <h2>🔔 Notifications</h2>
            <p className="page-subtitle">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <div className="page-actions">
            {unreadCount > 0 && (
              <button className="btn btn-secondary" onClick={handleMarkAllAsRead}>
                ✓ Mark All Read
              </button>
            )}
            {notifications.length > 0 && (
              <button className="btn btn-secondary" onClick={handleClearAll}>
                🗑️ Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="page-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="notifications-loading">
            <div className="spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="no-notifications">
            <span className="no-notif-icon">🔕</span>
            <h3>No notifications yet</h3>
            <p>You'll see notifications here when events occur</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notif) => (
              <div 
                key={notif._id} 
                className={`notification-item ${getSeverityClass(notif.severity)} ${!notif.isRead ? 'unread' : ''}`}
              >
                <div className="notif-icon">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="notif-content">
                  <h4 className="notif-title">{notif.title}</h4>
                  <p className="notif-message">{notif.message}</p>
                  <span className="notif-time">{formatTimeAgo(notif.createdAt)}</span>
                </div>
                <div className="notif-actions">
                  {!notif.isRead && (
                    <button 
                      className="btn-mark-read" 
                      onClick={() => handleMarkAsRead(notif._id)}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button 
                    className="btn-delete" 
                    onClick={() => handleDelete(notif._id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;

