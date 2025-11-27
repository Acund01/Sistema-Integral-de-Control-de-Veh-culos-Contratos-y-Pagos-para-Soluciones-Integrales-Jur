import React, { useEffect, useState } from 'react';
import type { ContratoResponseDto } from '../types/contract';
import { ConfirmDialog } from './ConfirmDialog';
import '../styles/ClientDetailsModal.css';
import { comprobanteService } from '../services/comprobanteService';
import type { ComprobanteRequestDto } from '../services/comprobanteService';
import { activityService } from '../services/activityService';
import { contratoService } from '../services/contratoService';

interface ContractDetailsModalProps {
  contract: ContratoResponseDto;
  onClose: () => void;
  onEdit?: (contract: ContratoResponseDto) => void;
  onDelete?: (id: string) => void;
}

const ContractDetailsModal: React.FC<ContractDetailsModalProps> = ({ contract, onClose, onEdit, onDelete }) => {
  // Mantener una copia local para poder actualizar estado (finalización)
  const [contractData, setContractData] = useState<ContratoResponseDto>(contract);
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
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleDelete = () => {
    if (onDelete) {
      setConfirmDialog({
        isOpen: true,
        title: 'Eliminar contrato',
        message: `¿Eliminar el contrato ${contractData.codigoContrato}?`,
        type: 'danger',
        onConfirm: () => {
          onDelete(contractData.id);
          onClose();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        },
      });
    }
  };

  const today = new Date();
  const clamp = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const isEnded = clamp(new Date(contractData.fechaFin)) < clamp(today) || (contractData.estado || '').toUpperCase() === 'FINALIZADO';
  const isFinalizable = !['FINALIZADO', 'CANCELADO'].includes((contractData.estado || '').toUpperCase());

  const [loadingComprobante, setLoadingComprobante] = useState(false);
  const [hasComprobante, setHasComprobante] = useState<boolean | null>(null);
  const [comprobanteId, setComprobanteId] = useState<string | null>(null);
  const [tipoComprobante, setTipoComprobante] = useState<'FACTURA' | 'BOLETA'>('BOLETA');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (isEnded) {
      comprobanteService.obtenerPorContrato(contractData.id)
        .then(c => { setHasComprobante(true); setComprobanteId(c.idComprobante); })
        .catch(() => setHasComprobante(false));
    }
  }, [isEnded, contractData.id]);

  const handleVerComprobante = async () => {
    if (!comprobanteId) return;
    try {
      setLoadingComprobante(true);
      const blob = await comprobanteService.descargarPdf(comprobanteId);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      activityService.log(`Visualizaste comprobante del contrato ${contractData.codigoContrato}`);
      // liberar luego de unos minutos (opcional)
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      setConfirmDialog({
        isOpen: true,
        title: 'Error',
        message: (e as Error).message || 'Error al descargar comprobante',
        type: 'danger',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
      });
    } finally {
      setLoadingComprobante(false);
    }
  };

  const handleGenerarComprobante = async () => {
    try {
      setGenerating(true);
      const dto: ComprobanteRequestDto = { idContrato: contractData.id, tipoComprobante };
      const comp = await comprobanteService.generar(dto);
      setComprobanteId(comp.idComprobante);
      setHasComprobante(true);
      activityService.log(`Generaste comprobante (${tipoComprobante}) del contrato ${contractData.codigoContrato}`);
      // Descargar inmediatamente
      const blob = await comprobanteService.descargarPdf(comp.idComprobante);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      setConfirmDialog({
        isOpen: true,
        title: 'Error',
        message: (e as Error).message || 'Error al generar comprobante',
        type: 'danger',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleFinalizarContrato = async () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Finalizar contrato',
      message: '¿Confirmas que deseas finalizar este contrato?',
      type: 'warning',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          const actualizado = await contratoService.finalizar(contractData.id);
          setContractData(actualizado);
          activityService.log(`Finalizaste el contrato ${actualizado.codigoContrato}`);
          setConfirmDialog({
            isOpen: true,
            title: 'Éxito',
            message: 'Contrato finalizado correctamente',
            type: 'success',
            onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
          });
        } catch (e) {
          setConfirmDialog({
            isOpen: true,
            title: 'Error',
            message: (e as Error).message || 'Error al finalizar contrato',
            type: 'danger',
            onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
          });
        }
      },
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="contract-details-title">
        <div className="modal-header">
          <div className="modal-title-area">
            <div className="modal-avatar">📄</div>
            <div>
              <h2 id="contract-details-title" className="modal-title">{contractData.codigoContrato}</h2>
              <div className={`status-badge ${isEnded || (contractData.estado || '').toUpperCase() === 'FINALIZADO' ? 'inactive' : 'active'}`}>
                {isEnded ? 'Inactivo' : contractData.estado}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="modal-body">
          <div className="details-grid">
            <div className="detail-row">
              <div className="detail-label">Cliente</div>
              <div className="detail-value">{contractData.cliente?.nombre}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Vehículo</div>
              <div className="detail-value">{`${contractData.detalles?.[0]?.marcaVehiculo || ''} ${contractData.detalles?.[0]?.modeloVehiculo || ''} (${contractData.detalles?.[0]?.placaVehiculo || ''})`}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Período</div>
              <div className="detail-value">{contractData.diasTotales} días</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Tarifa diaria</div>
              <div className="detail-value">S/. {(contractData.detalles?.[0]?.precioDiario || 0).toLocaleString()}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Fechas</div>
              <div className="detail-value">{contractData.fechaInicio} - {contractData.fechaFin}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Total</div>
              <div className="detail-value">S/. {Number(contractData.montoTotal || 0).toLocaleString()}</div>
            </div>
            {contractData.observaciones && (
              <div className="detail-row">
                <div className="detail-label">Observaciones</div>
                <div className="detail-value">
                  {contractData.observaciones
                    .split('|')
                    .map(o => o.trim())
                    .filter(Boolean)
                    .map((o, idx) => (
                      <div key={idx}>{o}</div>
                    ))}
                </div>
              </div>
            )}
            <div className="detail-row">
              <div className="detail-label">ID</div>
              <div className="detail-value monospace">{contractData.id}</div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
          {isFinalizable && (
            <button className="btn-primary" onClick={handleFinalizarContrato}>Finalizar Contrato</button>
          )}
          {isEnded && (
            hasComprobante ? (
              <button
                className="btn-secondary"
                onClick={handleVerComprobante}
                disabled={loadingComprobante}
              >{loadingComprobante ? 'Abriendo…' : 'Ver Comprobante'}</button>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select
                  value={tipoComprobante}
                  onChange={(e) => setTipoComprobante(e.target.value as 'FACTURA' | 'BOLETA')}
                  disabled={generating}
                  style={{ padding: '6px 8px', borderRadius: 6 }}
                >
                  <option value="BOLETA">Boleta</option>
                  <option value="FACTURA">Factura</option>
                </select>
                <button
                  className="btn-secondary"
                  onClick={handleGenerarComprobante}
                  disabled={generating}
                >{generating ? 'Generando…' : 'Generar Comprobante'}</button>
              </div>
            )
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

export default ContractDetailsModal;
