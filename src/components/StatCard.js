import React from 'react';
import './StatCard.css';

function StatCard({ icon, title, value, color }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <h3 style={{ color }}>{value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );
}

export default StatCard;

