import React, { useState, useEffect } from 'react';
import { getUnreadCount } from '../services/api';
import './NotificationBell.css';

function NotificationBell({ onNotificationClick }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    
    // Poll for new notifications every 10 seconds
    const interval = setInterval(loadUnreadCount, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      if (data.success) {
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleClick = () => {
    if (onNotificationClick) {
      onNotificationClick();
    }
  };

  return (
    <div className="notification-bell" onClick={handleClick}>
      <span className="bell-icon">🔔</span>
      {unreadCount > 0 && (
        <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
      )}
    </div>
  );
}

export default NotificationBell;

