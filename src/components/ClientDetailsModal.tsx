import React, { useEffect } from 'react';
import type { Client } from '../types/client';
import '../styles/ClientDetailsModal.css';

interface ClientDetailsModalProps {
  client: Client;
  onClose: () => void;
  onEdit?: (client: Client) => void;
  onDelete?: (id: string) => void;
  onChangeStatus?: (id: string, status: Client['status']) => void;
}

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({ client, onClose, onEdit, onDelete, onChangeStatus }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleDelete = () => {
    if (onDelete) {
      if (confirm(`¿Eliminar al cliente "${client.name}"?`)) {
        onDelete(client.id);
        onClose();
      }
    }
  };

  const created = client.createdAt ? new Date(client.createdAt) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="client-details-title">
        <div className="modal-header">
          <div className="modal-title-area">
            <div className="modal-avatar">👤</div>
            <div>
              <h2 id="client-details-title" className="modal-title">{client.name}</h2>
              <div className={`status-badge ${client.status.toLowerCase()}`}>{client.status}</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="modal-body">
          <div className="details-grid">
            <div className="detail-row">
              <div className="detail-label">Correo</div>
              <div className="detail-value">{client.email || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Teléfono</div>
              <div className="detail-value">{client.phone || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Ciudad</div>
              <div className="detail-value">{client.location || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Contratos</div>
              <div className="detail-value">{client.contracts}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">ID</div>
              <div className="detail-value monospace">{client.id}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Creado</div>
              <div className="detail-value">{created ? created.toLocaleString() : '—'}</div>
            </div>
          </div>

          <div className="modal-note">
            Nota: mostramos los campos actualmente guardados. Si deseas ver también documento, notas o datos de empresa, puedo guardar ese payload ampliado y mostrarlo aquí.
          </div>

          {onChangeStatus && (
            <div className="modal-note" style={{ marginTop: 12 }}>
              <div style={{ marginBottom: 8, fontWeight: 600, color: '#374151' }}>Cambiar estado</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['Activo','Inactivo'] as Client['status'][]).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onChangeStatus(client.id, s)}
                    className={"btn-secondary"}
                    style={{
                      borderColor: client.status === s ? '#111827' : undefined,
                      background: client.status === s ? '#111827' : undefined,
                      color: client.status === s ? '#fff' : undefined,
                    }}
                  >
                    {s}
                  </button>
                ))}
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
