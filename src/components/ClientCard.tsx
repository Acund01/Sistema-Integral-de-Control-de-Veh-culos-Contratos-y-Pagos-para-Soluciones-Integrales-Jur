import React from 'react';
import '../styles/ClientCard.css';
import type { Client } from '../types/client';

interface ClientCardProps {
  client: Client;
  onMenuClick: () => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onMenuClick }) => {
  return (
    <div className="client-card">
      <div className="client-avatar">
        <span className="avatar-icon">👤</span>
      </div>
      
      <div className="client-info">
        <h3 className="client-name">{client.name}</h3>
        <div className="client-details">
          <span className="client-detail">
            <span className="detail-icon">✉️</span>
            {client.email}
          </span>
          <span className="client-detail">
            <span className="detail-icon">📞</span>
            {client.phone}
          </span>
          <span className="client-detail">
            <span className="detail-icon">📍</span>
            {client.location}
          </span>
        </div>
      </div>

      <div className="client-contracts">
        <span className="contracts-number">{client.contracts}</span>
        <span className="contracts-label">Contratos</span>
      </div>

      <div className="client-status">
        <span className={`status-badge ${client.status.toLowerCase()}`}>
          {client.status}
        </span>
      </div>

      <button className="client-menu-btn" onClick={onMenuClick}>
        ⋯
      </button>
    </div>
  );
};

export default ClientCard;
