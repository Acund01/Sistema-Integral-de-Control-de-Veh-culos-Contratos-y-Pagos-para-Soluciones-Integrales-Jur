import React, { useEffect, useRef, useState } from 'react';
import '../styles/VehicleCard.css';
import type { Vehicle } from '../types/vehicle';

interface VehicleCardProps {
  vehicle: Vehicle;
  onViewDetails: () => void;
  onEditVehicle?: (vehicle: Vehicle) => void;
  onDeleteVehicle?: (id: string) => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onViewDetails, onEditVehicle, onDeleteVehicle }) => {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

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
          <span className="vehicle-icon">
           <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-car-suv" width="30" height="30" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M5 17a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path>
                    <path d="M16 17a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path>
                    <path d="M5 9l2 -4h7.438a2 2 0 0 1 1.94 1.515l.622 2.485h3a2 2 0 0 1 2 2v3"></path>
                    <path d="M10 9v-4"></path>
                    <path d="M2 7v4"></path>
                    <path d="M22.001 14.001a4.992 4.992 0 0 0 -4.001 -2.001a4.992 4.992 0 0 0 -4 2h-3a4.998 4.998 0 0 0 -8.003 .003"></path>
                    <path d="M5 12v-3h13"></path>
                </svg>
          </span>
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
        <div className="vehicle-menu-wrapper" ref={menuRef}>
          <button className="btn-menu" onClick={() => setOpenMenu(v => !v)} aria-haspopup="menu" aria-expanded={openMenu}>
            ⋯
          </button>
          {openMenu && (
            <div className="vehicle-menu" role="menu">
              <button className="vehicle-menu-item" role="menuitem" onClick={() => { onEditVehicle?.(vehicle); setOpenMenu(false); }}>
                <span className="menu-icon">✏️</span>
                Editar vehículo
              </button>
              <button className="vehicle-menu-item danger" role="menuitem" onClick={() => {
                if (onDeleteVehicle) {
                  if (confirm(`¿Eliminar el vehículo ${vehicle.brand} ${vehicle.model}?`)) {
                    onDeleteVehicle(vehicle.id);
                  }
                }
                setOpenMenu(false);
              }}>
                <span className="menu-icon">🗑️</span>
                Eliminar vehículo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
