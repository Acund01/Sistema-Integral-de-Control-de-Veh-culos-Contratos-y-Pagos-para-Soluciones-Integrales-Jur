import React, { useEffect } from 'react';
import type { Vehicle } from '../types/vehicle';
import '../styles/ClientDetailsModal.css';

interface VehicleDetailsModalProps {
  vehicle: Vehicle;
  onClose: () => void;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (id: string) => void;
  onChangeStatus?: (id: string, status: Vehicle['status']) => void;
}

const VehicleDetailsModal: React.FC<VehicleDetailsModalProps> = ({ vehicle, onClose, onEdit, onDelete, onChangeStatus }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleDelete = () => {
    if (onDelete) {
      if (confirm(`¿Eliminar el vehículo ${vehicle.brand} ${vehicle.model}?`)) {
        onDelete(vehicle.id);
        onClose();
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="vehicle-details-title">
        <div className="modal-header">
          <div className="modal-title-area">
            <div className="modal-avatar">🚗</div>
            <div>
              <h2 id="vehicle-details-title" className="modal-title">{vehicle.brand} {vehicle.model}</h2>
              <div className={`status-badge ${vehicle.status === 'Disponible' ? 'active' : 'inactive'}`}>{vehicle.status}</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="modal-body">
          <div className="details-grid">
            <div className="detail-row">
              <div className="detail-label">Tipo</div>
              <div className="detail-value">{vehicle.type || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Año</div>
              <div className="detail-value">{vehicle.year}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Placa</div>
              <div className="detail-value">{vehicle.plate || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Combustible</div>
              <div className="detail-value">{vehicle.fuel || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Últ. mantenimiento</div>
              <div className="detail-value">{vehicle.lastMaintenance || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">ID</div>
              <div className="detail-value monospace">{vehicle.id}</div>
            </div>
          </div>

          {onChangeStatus && (
            <div className="modal-note" style={{ marginTop: 20 }}>
              <div style={{ marginBottom: 8, fontWeight: 600, color: '#374151' }}>Cambiar estado</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(['Disponible','Mantenimiento','Alquilado'] as Vehicle['status'][]).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onChangeStatus(vehicle.id, s)}
                    className={"btn-secondary"}
                    style={{
                      borderColor: vehicle.status === s ? '#111827' : undefined,
                      background: vehicle.status === s ? '#111827' : undefined,
                      color: vehicle.status === s ? '#fff' : undefined,
                    }}
                  >
                    {s === 'Alquilado' ? 'Alquilando' : s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
          {onEdit && (
            <button className="btn-primary" onClick={() => onEdit(vehicle)}>Editar</button>
          )}
          {onDelete && (
            <button className="btn-danger" onClick={handleDelete}>Eliminar</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsModal;
