import React from 'react';
import '../styles/AlertCard.css';
import type { Alert } from '../types';

interface AlertCardProps extends Alert {
  onView: () => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ type, title, description, onView }) => {
  const getAlertIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'error':
        return '❌';
      default:
        return '📢';
    }
  };

  return (
    <div className={`alert-card alert-${type}`}>
      <div className="alert-icon">{getAlertIcon()}</div>
      <div className="alert-content">
        <h4 className="alert-title">{title}</h4>
        <p className="alert-description">{description}</p>
      </div>
      <button className="alert-button" onClick={onView}>
        Ver
      </button>
    </div>
  );
};

export default AlertCard;
