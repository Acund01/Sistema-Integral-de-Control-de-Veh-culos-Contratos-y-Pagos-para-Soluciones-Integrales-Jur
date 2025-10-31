import React, { useEffect } from 'react';
import type { ContratoResponseDto } from '../types/contract';
import '../styles/ClientDetailsModal.css';

interface ContractDetailsModalProps {
  contract: ContratoResponseDto;
  onClose: () => void;
  onEdit?: (contract: ContratoResponseDto) => void;
  onDelete?: (id: string) => void;
}

const ContractDetailsModal: React.FC<ContractDetailsModalProps> = ({ contract, onClose, onEdit, onDelete }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleDelete = () => {
    if (onDelete) {
      if (confirm(`¿Eliminar el contrato ${contract.codigoContrato}?`)) {
        onDelete(contract.id);
        onClose();
      }
    }
  };

  const today = new Date();
  const clamp = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const isEnded = clamp(new Date(contract.fechaFin)) < clamp(today);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="contract-details-title">
        <div className="modal-header">
          <div className="modal-title-area">
            <div className="modal-avatar">📄</div>
            <div>
              <h2 id="contract-details-title" className="modal-title">{contract.codigoContrato}</h2>
              <div className={`status-badge ${isEnded || (contract.estado || '').toUpperCase() === 'FINALIZADO' ? 'inactive' : 'active'}`}>
                {isEnded ? 'Inactivo' : contract.estado}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="modal-body">
          <div className="details-grid">
            <div className="detail-row">
              <div className="detail-label">Cliente</div>
              <div className="detail-value">{contract.cliente?.nombre}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Vehículo</div>
              <div className="detail-value">{`${contract.detalles?.[0]?.marcaVehiculo || ''} ${contract.detalles?.[0]?.modeloVehiculo || ''} (${contract.detalles?.[0]?.placaVehiculo || ''})`}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Período</div>
              <div className="detail-value">{contract.diasTotales} días</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Tarifa diaria</div>
              <div className="detail-value">S/. {(contract.detalles?.[0]?.precioDiario || 0).toLocaleString()}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Fechas</div>
              <div className="detail-value">{contract.fechaInicio} - {contract.fechaFin}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Total</div>
              <div className="detail-value">S/. {Number(contract.montoTotal || 0).toLocaleString()}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">ID</div>
              <div className="detail-value monospace">{contract.id}</div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
          {onEdit && (
            <button className="btn-primary" onClick={() => onEdit(contract)}>Editar</button>
          )}
          {onDelete && (
            <button className="btn-danger" onClick={handleDelete}>Eliminar</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractDetailsModal;
