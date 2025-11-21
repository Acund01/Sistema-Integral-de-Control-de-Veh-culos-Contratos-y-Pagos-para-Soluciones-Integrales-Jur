import React, { useEffect, useRef, useState, useMemo } from 'react';
import '../styles/ContractCard.css';
import type { ContratoResponseDto } from '../types/contract';

interface ContractCardProps {
  contract: ContratoResponseDto;
  onViewDetails: () => void;
  onEdit?: (contract: ContratoResponseDto) => void;
  onDelete?: (id: string) => void;
}

const ContractCard: React.FC<ContractCardProps> = ({ contract, onViewDetails, onEdit, onDelete }) => {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const today = new Date();
  const clamp = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const isEnded = clamp(new Date(contract.fechaFin)) < clamp(today);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  const getStatusBadge = () => {
    const est = (contract.estado || '').toUpperCase();
    if (isEnded && est !== 'FINALIZADO' && est !== 'CANCELADO') {
      return <span className="contract-status-badge inactivo">• Inactivo</span>;
    }
    if (est === 'FINALIZADO') return <span className="contract-status-badge finalizado">✓ Finalizado</span>;
    if (est === 'CANCELADO') return <span className="contract-status-badge pendiente">⏱ Cancelado</span>;
    return <span className="contract-status-badge activo">✓ Activo</span>;
  };

  // Lógica para recalcular el total igual que el resumen previo a crear
  const computedTotal = useMemo(() => {
    try {
      const days = contract.diasTotales || 0;
      const daily = contract.detalles?.[0]?.precioDiario || 0;
      const subtotal = days * daily;
      const obs = contract.observaciones || '';

      // Extraer depósito numérico
      let deposit = 0;
      const depMatch = obs.match(/Depósito:\s*S\/.?\s*(\d+[,.]?\d*)/i);
      if (depMatch) {
        deposit = Number(depMatch[1].replace(',', '.')) || 0;
      }

      // Calcular total: (subtotal + depósito) + IGV
      const baseForTax = subtotal + deposit;
      const taxes = baseForTax * 0.18;
      const total = baseForTax + taxes;
      return total;
    } catch {
      return Number(contract.montoTotal || 0);
    }
  }, [contract]);

  // Calcular días restantes hasta la fecha de fin
  const daysRemaining = useMemo(() => {
    try {
      const endDate = new Date(contract.fechaFin);
      const todayDate = new Date();
      const diff = endDate.getTime() - todayDate.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 0;
    } catch {
      return 0;
    }
  }, [contract.fechaFin]);

  return (
    <div className="contract-card">
      <div className="contract-header">
        <div className="contract-title-section">
          <span className="contract-icon">📄</span>
          <div className="contract-info">
            <h3 className="contract-number">{contract.codigoContrato}</h3>
            <p className="contract-client">{contract.cliente?.nombre}</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="contract-details">
        <div className="contract-detail-row">
          <div className="detail-item">
            <span className="detail-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-car-suv" width="26" height="28" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
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
            <div className="detail-content">
              <span className="detail-label">Vehículo</span>
              <span className="detail-value">{`${contract.detalles?.[0]?.marcaVehiculo || ''} ${contract.detalles?.[0]?.modeloVehiculo || ''} (${contract.detalles?.[0]?.placaVehiculo || ''})`}</span>
            </div>
          </div>
        </div>

        <div className="contract-detail-grid">
          <div className="detail-item-small">
            <span className="detail-icon-small">
              <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-calendar-stats" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M11.795 21h-6.795a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v4"></path>
                  <path d="M18 14v4h4"></path>
                  <path d="M18 18m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"></path>
                  <path d="M15 3v4"></path>
                  <path d="M7 3v4"></path>
                  <path d="M3 11h16"></path>
              </svg>
            </span>
            <div className="detail-content-small">
              <span className="detail-label-small">Período</span>
              <span className="detail-value-small">{contract.diasTotales} días {daysRemaining > 0 ? `(${daysRemaining} restantes)` : '(finalizado)'}</span>
            </div>
          </div>

          <div className="detail-item-small">
            <span className="detail-icon-small">
               <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-coins" width="26" height="26" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M9 14c0 1.657 2.686 3 6 3s6 -1.343 6 -3s-2.686 -3 -6 -3s-6 1.343 -6 3z"></path>
                <path d="M9 14v4c0 1.656 2.686 3 6 3s6 -1.344 6 -3v-4"></path>
                <path d="M3 6c0 1.072 1.144 2.062 3 2.598s4.144 .536 6 0c1.856 -.536 3 -1.526 3 -2.598c0 -1.072 -1.144 -2.062 -3 -2.598s-4.144 -.536 -6 0c-1.856 .536 -3 1.526 -3 2.598z"></path>
                <path d="M3 6v10c0 .888 .772 1.45 2 2"></path>
                <path d="M3 11c0 .888 .772 1.45 2 2"></path>
            </svg>
            </span>
            <div className="detail-content-small">
              <span className="detail-label-small">Total</span>
              <span className="detail-value-small">S/. {computedTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="detail-item-small">
            <span className="detail-icon-small">🕐</span>
            <div className="detail-content-small">
              <span className="detail-label-small">Fechas</span>
              <span className="detail-value-small">{contract.fechaInicio} - {contract.fechaFin}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="contract-footer">
        <span className="daily-rate">Tarifa diaria: S/. {(contract.detalles?.[0]?.precioDiario || 0).toLocaleString()}</span>
        <div className="contract-actions">
          <button className="btn-contract-details" onClick={onViewDetails}>
            Ver Detalles
          </button>
          <div className="contract-menu-wrapper" ref={menuRef}>
            <button className="btn-contract-menu" onClick={() => setOpenMenu(v => !v)} aria-haspopup="menu" aria-expanded={openMenu}>
              ⋯
            </button>
            {openMenu && (
              <div className="contract-menu" role="menu">
                <button className="contract-menu-item" role="menuitem" onClick={() => { onEdit?.(contract); setOpenMenu(false); }}>
                  <span className="menu-icon">✏️</span>
                  Editar contrato
                </button>
                <button className="contract-menu-item danger" role="menuitem" onClick={() => {
                  onDelete?.(contract.id);
                  setOpenMenu(false);
                }}>
                  <span className="menu-icon">🗑️</span>
                  Eliminar contrato
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractCard;
