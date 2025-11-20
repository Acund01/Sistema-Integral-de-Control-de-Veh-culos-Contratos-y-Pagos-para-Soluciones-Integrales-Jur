import React, { useEffect, useMemo, useState } from 'react';
import type { ClienteUnion } from '../types/client';
import '../styles/ClientDetailsModal.css';
import { clienteService } from '../services/clienteService';

interface ClientDetailsModalProps {
  client: ClienteUnion;
  onClose: () => void;
  onEdit?: (client: ClienteUnion) => void;
  onDelete?: (id: string) => void;
  onChangeStatus?: (id: string, activo: boolean) => void;
}

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({ client, onClose, onEdit, onDelete, onChangeStatus }) => {
  // Estado local para permitir recarga completa de información (incl. campos opcionales)
  const [fullClient, setFullClient] = useState<ClienteUnion>(client);
  const [loadingExtra, setLoadingExtra] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    const fetchFull = async () => {
      try {
        setLoadingExtra(true);
        const fresh = await clienteService.findById(client.id);
        if (!cancelled) setFullClient(fresh);
      } catch {
        // si falla, mantenemos datos existentes
      } finally {
        if (!cancelled) setLoadingExtra(false);
      }
    };
    fetchFull();
    return () => { cancelled = true; };
  }, [client.id]);

  const displayName = useMemo(() => (
    fullClient.tipoCliente === 'NATURAL'
      ? `${fullClient.nombre} ${fullClient.apellido}`
      : fullClient.razonSocial
  ), [fullClient]);

  const handleDelete = () => {
    if (onDelete) {
      if (confirm(`¿Eliminar al cliente "${displayName}"?`)) {
        onDelete(fullClient.id);
        onClose();
      }
    }
  };

  const created = fullClient.creadoEn ? new Date(fullClient.creadoEn) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="client-details-title">
        <div className="modal-header">
          <div className="modal-title-area">
            <div className="modal-avatar">👤</div>
            <div>
              <h2 id="client-details-title" className="modal-title">{displayName}</h2>
                <div className={`status-badge ${fullClient.activo ? 'activo' : 'inactivo'}`}>{fullClient.activo ? 'Activo' : 'Inactivo'}{loadingExtra && ' · …'}</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="modal-body">
          <div className="details-grid">
            <div className="detail-row">
              <div className="detail-label">Correo</div>
              <div className="detail-value">{fullClient.correo || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Teléfono</div>
              <div className="detail-value">{fullClient.telefono || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Dirección</div>
              <div className="detail-value">{fullClient.direccion || '—'}</div>
            </div>
            {(fullClient as any).contactoEmergenciaNombre && (
              <div className="detail-row">
                <div className="detail-label">Contacto Emergencia</div>
                <div className="detail-value">{(fullClient as any).contactoEmergenciaNombre}</div>
              </div>
            )}
            {(fullClient as any).contactoEmergenciaTelefono && (
              <div className="detail-row">
                <div className="detail-label">Teléfono Emergencia</div>
                <div className="detail-value">{(fullClient as any).contactoEmergenciaTelefono}</div>
              </div>
            )}
            {(fullClient as any).notas && (
              <div className="detail-row">
                <div className="detail-label">Notas</div>
                <div className="detail-value">{(fullClient as any).notas}</div>
              </div>
            )}
            <div className="detail-row">
              <div className="detail-label">ID</div>
              <div className="detail-value monospace">{fullClient.id}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Creado</div>
              <div className="detail-value">{created ? created.toLocaleString() : '—'}</div>
            </div>
            {fullClient.tipoCliente === 'NATURAL' ? (
              <>
                <div className="detail-row">
                  <div className="detail-label">Documento</div>
                  <div className="detail-value">{(fullClient as any).tipoDocumento}: {(fullClient as any).numeroDocumento}</div>
                </div>
              </>
            ) : (
              <>
                <div className="detail-row">
                  <div className="detail-label">RUC</div>
                  <div className="detail-value">{(fullClient as any).ruc}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Razón Social</div>
                  <div className="detail-value">{(fullClient as any).razonSocial}</div>
                </div>
                { (fullClient as any).representante && (
                  <>
                    <div className="detail-row">
                      <div className="detail-label">Representante</div>
                      <div className="detail-value">{(fullClient as any).representante.nombre} {(fullClient as any).representante.apellido}</div>
                    </div>
                    <div className="detail-row">
                      <div className="detail-label">Doc. Representante</div>
                      <div className="detail-value">{(fullClient as any).representante.tipoDocumento}: {(fullClient as any).representante.numeroDocumento}</div>
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
            <button className="btn-primary" onClick={() => onEdit(fullClient)}>Editar</button>
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
