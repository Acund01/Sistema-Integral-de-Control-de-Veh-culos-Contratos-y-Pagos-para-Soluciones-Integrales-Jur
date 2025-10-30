import React from 'react';
import '../styles/QuickActionCard.css';
import type { QuickAction } from '../types';

interface QuickActionCardProps extends QuickAction {
  onClick: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, description, onClick }) => {
  return (
    <div className="quick-action-card" onClick={onClick}>
      <div className="action-content">
        <h3 className="action-title">{title}</h3>
        <p className="action-description">{description}</p>
      </div>
      <button
        className="action-button"
        aria-label={`Ir a ${title}`}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        Ir
      </button>
    </div>
  );
};

export default QuickActionCard;
