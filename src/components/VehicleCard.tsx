import React, { useEffect, useRef, useState } from 'react';
import '../styles/VehicleCard.css';
import type { Vehiculo, EstadoVehiculo, TipoCombustible } from '../types/vehicle';

interface VehicleCardProps {
  vehicle: Vehiculo;
  onViewDetails: () => void;
  onEditVehicle?: (vehicle: Vehiculo) => void;
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
    if (!vehicle.activo) {
      return <span className="status-badge inactivo">Inactivo</span>;
    }
    switch (vehicle.estado as EstadoVehiculo) {
      case 'DISPONIBLE':
        return <span className="status-badge disponible">Disponible</span>;
      case 'ALQUILADO':
        return <span className="status-badge alquilado">Alquilado</span>;
      case 'MANTENIMIENTO':
        return <span className="status-badge mantenimiento">Mantenimiento</span>;
      default:
        return null;
    }
  };

  const prettyFuel = (f: TipoCombustible) => {
    switch (f) {
      case 'GASOLINA': return 'Gasolina';
      case 'DIESEL': return 'Diésel';
      case 'ELECTRICO': return 'Eléctrico';
      case 'HIBRIDO': return 'Híbrido';
      case 'GLP': return 'GLP';
      default: return String(f);
    }
  };

  return (
    <div className="vehicle-card">
      <div className="vehicle-image-container">
        {vehicle.imagenUrl ? (
          <>
            <div 
              className="vehicle-image-bg"
              style={{ backgroundImage: `url('${vehicle.imagenUrl}')` }}
            />
            <img 
              src={vehicle.imagenUrl} 
              alt={`${vehicle.modelo?.marca?.nombre} ${vehicle.modelo?.nombre}`} 
              className="vehicle-image"
            />
          </>
        ) : (
          <div className="vehicle-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-car" width="64" height="64" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <circle cx="7" cy="17" r="2" />
              <circle cx="17" cy="17" r="2" />
              <path d="M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5" />
            </svg>
          </div>
        )}
        <div className="vehicle-status-overlay">
          {getStatusBadge()}
        </div>
      </div>

      <div className="vehicle-content">
        <div className="vehicle-header-info">
          <h3 className="vehicle-name">{vehicle.modelo?.marca?.nombre} {vehicle.modelo?.nombre}</h3>
          <span className="vehicle-plate">{vehicle.placa}</span>
        </div>

        <div className="vehicle-details-grid">
          <div className="detail-item">
            <svg xmlns="http://www.w3.org/2000/svg" className="detail-icon" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
            <span>{vehicle.anioFabricacion}</span>
          </div>
          <div className="detail-item">
            <svg xmlns="http://www.w3.org/2000/svg" className="detail-icon" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M6 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
              <path d="M18 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
              <path d="M4 17h-2v-11a1 1 0 0 1 1 -1h14a5 7 0 0 1 5 7v5h-2m-4 0h-8" />
            </svg>
            <span>{vehicle.tipoVehiculo?.nombre}</span>
          </div>
          <div className="detail-item">
            <svg xmlns="http://www.w3.org/2000/svg" className="detail-icon" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M6 21h12" />
              <path d="M12 21v-10" />
              <path d="M12 11a5 5 0 0 1 5 -5v-2a2 2 0 0 0 -4 0" />
              <path d="M12 11a5 5 0 0 0 -5 -5v-2a2 2 0 0 1 4 0" />
            </svg>
            <span>{prettyFuel(vehicle.combustible)}</span>
          </div>
        </div>

        <div className="vehicle-actions">
          <button className="btn-action primary" onClick={onViewDetails}>
            Ver Detalles
          </button>
          
          <div className="menu-container" ref={menuRef}>
            <button className="btn-action icon-only" onClick={() => setOpenMenu(!openMenu)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="19" r="1" />
                <circle cx="12" cy="5" r="1" />
              </svg>
            </button>
            
            {openMenu && (
              <div className="dropdown-menu">
                {onEditVehicle && (
                  <button className="dropdown-item" onClick={() => {
                    onEditVehicle(vehicle);
                    setOpenMenu(false);
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <path d="M4 20h4l10.5 -10.5a1.5 1.5 0 0 0 -4 -4l-10.5 10.5v4" />
                      <line x1="13.5" y1="6.5" x2="17.5" y2="10.5" />
                    </svg>
                    Editar
                  </button>
                )}
                {onDeleteVehicle && (
                  <button className="dropdown-item danger" onClick={() => {
                    onDeleteVehicle(vehicle.id);
                    setOpenMenu(false);
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <line x1="4" y1="7" x2="20" y2="7" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                      <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                      <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                    </svg>
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
