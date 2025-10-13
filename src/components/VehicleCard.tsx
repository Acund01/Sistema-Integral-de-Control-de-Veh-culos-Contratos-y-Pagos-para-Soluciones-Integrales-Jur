import React from 'react';
import '../styles/VehicleCard.css';
import type { Vehicle } from '../types/vehicle';

interface VehicleCardProps {
  vehicle: Vehicle;
  onViewDetails: () => void;
  onMenuClick: () => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onViewDetails, onMenuClick }) => {
  const getStatusBadge = () => {
    switch (vehicle.status) {
      case 'Disponible':
        return <span className="status-badge disponible">✓ Disponible</span>;
      case 'Alquilado':
        return <span className="status-badge alquilado">⏱ Alquilado</span>;
      case 'Mantenimiento':
        return <span className="status-badge mantenimiento">⚠ Mantenimiento</span>;
      default:
        return null;
    }
  };

  return (
    <div className="vehicle-card">
      <div className="vehicle-header">
        <div className="vehicle-title">
          <span className="vehicle-icon">🚗</span>
          <h3 className="vehicle-name">{vehicle.brand} {vehicle.model}</h3>
        </div>
        {getStatusBadge()}
      </div>

      <div className="vehicle-details-grid">
        <div className="detail-row">
          <span className="detail-label">Tipo</span>
          <span className="detail-value">{vehicle.type}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Año</span>
          <span className="detail-value">{vehicle.year}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Placa</span>
          <span className="detail-value">{vehicle.plate}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Combustible</span>
          <span className="detail-value">{vehicle.fuel}</span>
        </div>
      </div>

      <div className="vehicle-maintenance">
        <span className="maintenance-icon">📅</span>
        <span className="maintenance-text">Últ. mantenimiento: {vehicle.lastMaintenance}</span>
      </div>

      <div className="vehicle-actions">
        <button className="btn-details" onClick={onViewDetails}>
          Ver Detalles
        </button>
        <button className="btn-menu" onClick={onMenuClick}>
          ⋯
        </button>
      </div>
    </div>
  );
};

export default VehicleCard;
