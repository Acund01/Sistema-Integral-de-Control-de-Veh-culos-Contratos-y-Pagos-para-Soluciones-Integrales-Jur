import React from 'react';
import '../styles/StatCard.css';
import type { StatCard as StatCardType } from '../types';


const StatCard: React.FC<StatCardType> = ({ title, value, change, changeType, icon }) => {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className={`stat-change ${changeType}`}>
        <span className="change-arrow">
          {changeType === 'positive' ? '↗' : changeType === 'negative' ? '↘' : '→'}
        </span>
        <span className="change-text">{change}</span>
      </div>
     
    </div>
  );
};

export default StatCard;
