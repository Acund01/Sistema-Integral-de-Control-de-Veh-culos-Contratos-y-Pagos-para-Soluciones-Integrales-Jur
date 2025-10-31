import React, { useEffect, useMemo } from 'react';
import type { ClienteUnion } from '../types/client';
import '../styles/ClientDetailsModal.css';

interface ClientDetailsModalProps {
  client: ClienteUnion;
  onClose: () => void;
  onEdit?: (client: ClienteUnion) => void;
  onDelete?: (id: string) => void;
  onChangeStatus?: (id: string, activo: boolean) => void;
}

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({ client, onClose, onEdit, onDelete, onChangeStatus }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const displayName = useMemo(() => (
    client.tipoCliente === 'NATURAL'
      ? `${client.nombre} ${client.apellido}`
      : client.razonSocial
  ), [client]);

  const handleDelete = () => {
    if (onDelete) {
      if (confirm(`¿Eliminar al cliente "${displayName}"?`)) {
        onDelete(client.id);
        onClose();
      }
    }
  };

  const created = client.creadoEn ? new Date(client.creadoEn) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="client-details-title">
        <div className="modal-header">
          <div className="modal-title-area">
            <div className="modal-avatar">👤</div>
            <div>
              <h2 id="client-details-title" className="modal-title">{displayName}</h2>
              <div className={`status-badge ${client.activo ? 'activo' : 'inactivo'}`}>{client.activo ? 'Activo' : 'Inactivo'}</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="modal-body">
          <div className="details-grid">
            <div className="detail-row">
              <div className="detail-label">Correo</div>
              <div className="detail-value">{client.correo || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Teléfono</div>
              <div className="detail-value">{client.telefono || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Dirección</div>
              <div className="detail-value">{client.direccion || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">ID</div>
              <div className="detail-value monospace">{client.id}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Creado</div>
              <div className="detail-value">{created ? created.toLocaleString() : '—'}</div>
            </div>
            {client.tipoCliente === 'NATURAL' ? (
              <>
                <div className="detail-row">
                  <div className="detail-label">Documento</div>
                  <div className="detail-value">{client.tipoDocumento}: {client.numeroDocumento}</div>
                </div>
              </>
            ) : (
              <>
                <div className="detail-row">
                  <div className="detail-label">RUC</div>
                  <div className="detail-value">{client.ruc}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Razón Social</div>
                  <div className="detail-value">{client.razonSocial}</div>
                </div>
                {client.representante && (
                  <>
                    <div className="detail-row">
                      <div className="detail-label">Representante</div>
                      <div className="detail-value">{client.representante.nombre} {client.representante.apellido}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Doc. Representante</div>
                      <div className="detail-value">{client.representante.tipoDocumento}: {client.representante.numeroDocumento}</div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {onChangeStatus && (
            <div className="modal-note" style={{ marginTop: 12 }}>
              <div style={{ marginBottom: 8, fontWeight: 600, color: '#374151' }}>Cambiar estado</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => onChangeStatus(client.id, true)}
                  className={"btn-secondary"}
                  style={{
                    borderColor: client.activo ? '#111827' : undefined,
                    background: client.activo ? '#111827' : undefined,
                    color: client.activo ? '#fff' : undefined,
                  }}
                >
                  Activo
                </button>
                <button
                  type="button"
                  onClick={() => onChangeStatus(client.id, false)}
                  className={"btn-secondary"}
                  style={{
                    borderColor: !client.activo ? '#111827' : undefined,
                    background: !client.activo ? '#111827' : undefined,
                    color: !client.activo ? '#fff' : undefined,
                  }}
                >
                  Inactivo
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
          {onEdit && (
            <button className="btn-primary" onClick={() => onEdit(client)}>Editar</button>
          )}
          {onDelete && (
            <button className="btn-danger" onClick={handleDelete}>Eliminar</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsModal;
