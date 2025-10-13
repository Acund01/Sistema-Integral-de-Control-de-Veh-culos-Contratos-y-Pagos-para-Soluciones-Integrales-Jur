import React from 'react';
import '../styles/ContractCard.css';
import type { Contract } from '../types/contract';

interface ContractCardProps {
  contract: Contract;
  onViewDetails: () => void;
  onMenuClick: () => void;
}

const ContractCard: React.FC<ContractCardProps> = ({ contract, onViewDetails, onMenuClick }) => {
  const getStatusBadge = () => {
    switch (contract.status) {
      case 'Activo':
        return <span className="contract-status-badge activo">✓ Activo</span>;
      case 'Finalizado':
        return <span className="contract-status-badge finalizado">✓ Finalizado</span>;
      case 'Por Vencer':
        return <span className="contract-status-badge por-vencer">⚠ Por Vencer</span>;
      case 'Pendiente':
        return <span className="contract-status-badge pendiente">⏱ Pendiente</span>;
      default:
        return null;
    }
  };

  return (
    <div className="contract-card">
      <div className="contract-header">
        <div className="contract-title-section">
          <span className="contract-icon">📄</span>
          <div className="contract-info">
            <h3 className="contract-number">{contract.contractNumber}</h3>
            <p className="contract-client">{contract.clientName}</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="contract-details">
        <div className="contract-detail-row">
          <div className="detail-item">
            <span className="detail-icon">🚗</span>
            <div className="detail-content">
              <span className="detail-label">Vehículo</span>
              <span className="detail-value">{contract.vehicle} ({contract.vehiclePlate}) - {contract.vehicleType}</span>
            </div>
          </div>
        </div>

        <div className="contract-detail-grid">
          <div className="detail-item-small">
            <span className="detail-icon-small">📅</span>
            <div className="detail-content-small">
              <span className="detail-label-small">Período</span>
              <span className="detail-value-small">{contract.period} días</span>
            </div>
          </div>

          <div className="detail-item-small">
            <span className="detail-icon-small">💰</span>
            <div className="detail-content-small">
              <span className="detail-label-small">Total</span>
              <span className="detail-value-small">S/. {contract.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="detail-item-small">
            <span className="detail-icon-small">🕐</span>
            <div className="detail-content-small">
              <span className="detail-label-small">Fechas</span>
              <span className="detail-value-small">{contract.startDate} - {contract.endDate}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="contract-footer">
        <span className="daily-rate">Tarifa diaria: S/. {contract.dailyRate.toLocaleString()}</span>
        <div className="contract-actions">
          <button className="btn-contract-details" onClick={onViewDetails}>
            Ver Detalles
          </button>
          <button className="btn-contract-menu" onClick={onMenuClick}>
            ⋯
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractCard;
