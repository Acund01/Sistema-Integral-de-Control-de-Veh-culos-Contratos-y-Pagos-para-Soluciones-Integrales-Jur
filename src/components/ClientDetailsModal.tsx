import React, { useEffect, useMemo, useState } from 'react';
import type { ClienteUnion } from '../types/client';
import { ConfirmDialog } from './ConfirmDialog';
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
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'warning' | 'danger' | 'info' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
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
        let fresh: ClienteUnion;
        if (client.tipoCliente === 'NATURAL') {
          fresh = await clienteService.findNaturalById(client.id) as ClienteUnion;
        } else {
          fresh = await clienteService.findEmpresaById(client.id) as ClienteUnion;
        }
        if (!cancelled) setFullClient(fresh);
      } catch (e) {
        // mantener datos existentes si falla
        console.warn('No se pudo cargar info completa del cliente', e);
      } finally {
        if (!cancelled) setLoadingExtra(false);
      }
    };
    fetchFull();
    return () => { cancelled = true; };
  }, [client.id, client.tipoCliente]);

  const displayName = useMemo(() => (
    fullClient.tipoCliente === 'NATURAL'
      ? `${fullClient.nombre} ${fullClient.apellido}`
      : fullClient.razonSocial
  ), [fullClient]);

  const handleDelete = async () => {
    if (!onDelete) return;
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar cliente',
      message: `¿Eliminar definitivamente al cliente "${displayName}"? Esta acción no se puede deshacer.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await clienteService.delete(fullClient.id);
          setConfirmDialog({
            isOpen: true,
            title: 'Éxito',
            message: 'Cliente eliminado',
            type: 'success',
            onConfirm: () => {
              setConfirmDialog(prev => ({ ...prev, isOpen: false }));
              onDelete(fullClient.id);
              onClose();
            },
          });
        } catch (e) {
          setConfirmDialog({
            isOpen: true,
            title: 'Error',
            message: `Error al eliminar: ${e instanceof Error ? e.message : 'Error desconocido'}`,
            type: 'danger',
            onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
          });
        }
      },
    });
  };

  const handleChangeStatus = async () => {
    if (!onChangeStatus) return;
    const newStatus = !fullClient.activo;
    const action = newStatus ? 'activar' : 'inactivar';
    setConfirmDialog({
      isOpen: true,
      title: `${newStatus ? 'Activar' : 'Inactivar'} cliente`,
      message: `¿Está seguro de ${action} a "${displayName}"?`,
      type: 'warning',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await clienteService.setActivo(fullClient.id, newStatus);
          onChangeStatus(fullClient.id, newStatus);
          onClose();
        } catch (e) {
          setConfirmDialog({
            isOpen: true,
            title: 'Error',
            message: `Error al ${action}: ${e instanceof Error ? e.message : 'Error desconocido'}`,
            type: 'danger',
            onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
          });
        }
      },
    });
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
            {/* Notas eliminadas */}
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

        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
          {onChangeStatus && (
            <button 
              className={fullClient.activo ? "btn-warning" : "btn-success"} 
              onClick={handleChangeStatus}
            >
              {fullClient.activo ? 'Inactivar' : 'Activar'}
            </button>
          )}
          {onEdit && (
            <button className="btn-primary" onClick={() => onEdit(fullClient)}>Editar</button>
          )}
          {onDelete && (
            <button className="btn-danger" onClick={handleDelete}>Eliminar</button>
          )}
        </div>
      </div>
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default ClientDetailsModal;
