import React, { useEffect, useMemo, useState } from 'react';
import ContractCard from '../components/ContractCard';
import ContractDetailsModal from '../components/ContractDetailsModal';
import '../styles/ContractManagement.css';
import type { ContratoResponseDto, ContractStats } from '../types/contract';
import { contratoService } from '../services/contratoService';

interface ContractManagementProps {
  onNavigate?: (menuId: string) => void;
  contracts?: ContratoResponseDto[];
  onDeleteContract?: (id: string) => void;
  onStartEditContract?: (contract: ContratoResponseDto) => void;
}

const ContractManagement: React.FC<ContractManagementProps> = ({ onNavigate, contracts = [], onDeleteContract, onStartEditContract }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContract, setSelectedContract] = useState<ContratoResponseDto | null>(null);
  const [items, setItems] = useState<ContratoResponseDto[]>(contracts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setItems(contracts); }, [contracts]);
  useEffect(() => {
    if (contracts.length === 0) {
      setLoading(true);
      contratoService.findAll()
        .then(setItems)
        .catch(err => setError(err?.message || 'Error al cargar contratos'))
        .finally(() => setLoading(false));
    }
  }, [contracts.length]);

  // Cálculo de estadísticas dinámicas según contratos recibidos
  const stats: ContractStats = useMemo(() => {
    const total = items.length;
    const today = new Date();
    const clamp = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const active = items.filter(c => (
      (c.estado?.toUpperCase?.() !== 'FINALIZADO' && c.estado?.toUpperCase?.() !== 'CANCELADO') &&
      clamp(new Date(c.fechaFin)) >= clamp(today)
    )).length;

    // Por vencer: estado 'Por Vencer' o fin dentro de 30 días
    const now = new Date();
    const in30 = new Date(now);
    in30.setDate(in30.getDate() + 30);
    const expiring = items.filter(c => {
      const end = new Date(c.fechaFin);
      const est = (c.estado || '').toUpperCase();
      return end >= now && end <= in30 && est !== 'FINALIZADO' && est !== 'CANCELADO';
    }).length;

    // Ingresos del mes actual (prorrateado por días dentro del mes)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); // último día del mes

    const clampDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const daysBetweenInclusive = (a: Date, b: Date) => Math.max(0, Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const monthlyIncome = items.reduce((acc, c) => {
      const start = clampDate(new Date(c.fechaInicio));
      const end = clampDate(new Date(c.fechaFin));
      const startOverlap = start < monthStart ? monthStart : start;
      const endOverlap = end > monthEnd ? monthEnd : end;
      if (endOverlap < monthStart || startOverlap > monthEnd) return acc;
      const days = daysBetweenInclusive(startOverlap, endOverlap);
      const precioDiario = c.detalles?.[0]?.precioDiario || 0;
      return acc + days * precioDiario;
    }, 0);

    return { total, active, expiring, monthlyIncome };
  }, [items]);

  // La lista de contratos proviene de la prop `contracts` (por defecto vacía)
  

  const filteredContracts = items.filter(contract => {
    const t = searchTerm.toLowerCase();
    const veh = `${contract.detalles?.[0]?.marcaVehiculo || ''} ${contract.detalles?.[0]?.modeloVehiculo || ''} ${contract.detalles?.[0]?.placaVehiculo || ''}`.toLowerCase();
    return (
      contract.codigoContrato?.toLowerCase().includes(t) ||
      contract.cliente?.nombre?.toLowerCase().includes(t) ||
      veh.includes(t)
    );
  });

  const handleNewContract = () => {
    onNavigate?.('crear-contrato');
  };

  const handleViewDetails = (contract: ContratoResponseDto) => setSelectedContract(contract);
  const handleDelete = (id: string) => {
    if (onDeleteContract) return onDeleteContract(id);
    contratoService.delete(id)
      .then(() => setItems(prev => prev.filter(c => c.id !== id)))
      .catch(err => alert(err?.message || 'No se pudo eliminar el contrato'));
  };
  const handleEdit = (contract: ContratoResponseDto) => onStartEditContract?.(contract);

  const handleFilters = () => {
    console.log('Abrir filtros');
  };

  const handleStateFilter = () => {
    console.log('Filtrar por estado');
  };

  return (
    <div className="contract-management">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Contratos de Alquiler</h1>
          <p className="page-subtitle">Gestiona todos los contratos de alquiler de vehículos</p>
        </div>
        <button className="btn-primary" onClick={handleNewContract}>
          <span className="btn-icon">+</span>
          Nuevo Contrato
        </button>
      </div>

      {/* Stats Cards */}
      <div className="contract-stats">
        <div className="stat-card-simple">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-files" width="36" height="36" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M15 3v4a1 1 0 0 0 1 1h4"></path>
                <path d="M18 17h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h4l5 5v7a2 2 0 0 1 -2 2z"></path>
                <path d="M16 17v2a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h2"></path>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Contratos Totales</div>
          </div>
        </div>

        <div className="stat-card-simple">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Contratos Activos</div>
          </div>
        </div>

        <div className="stat-card-simple">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-24-hours" width="36" height="36" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M4 13c.325 2.532 1.881 4.781 4 6"></path>
                <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2"></path>
                <path d="M4 5v4h4"></path>
                <path d="M12 15h2a1 1 0 0 1 1 1v1a1 1 0 0 1 -1 1h-1a1 1 0 0 0 -1 1v1a1 1 0 0 0 1 1h2"></path>
                <path d="M18 15v2a1 1 0 0 0 1 1h1"></path>
                <path d="M21 15v6"></path>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.expiring}</div>
            <div className="stat-label">Por Vencer</div>
          </div>
        </div>

        <div className="stat-card-simple">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-coins" width="36" height="36" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M9 14c0 1.657 2.686 3 6 3s6 -1.343 6 -3s-2.686 -3 -6 -3s-6 1.343 -6 3z"></path>
                <path d="M9 14v4c0 1.656 2.686 3 6 3s6 -1.344 6 -3v-4"></path>
                <path d="M3 6c0 1.072 1.144 2.062 3 2.598s4.144 .536 6 0c1.856 -.536 3 -1.526 3 -2.598c0 -1.072 -1.144 -2.062 -3 -2.598s-4.144 -.536 -6 0c-1.856 .536 -3 1.526 -3 2.598z"></path>
                <path d="M3 6v10c0 .888 .772 1.45 2 2"></path>
                <path d="M3 11c0 .888 .772 1.45 2 2"></path>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">S/. {stats.monthlyIncome.toLocaleString()}</div>
            <div className="stat-label">Ingresos del Mes</div>
          </div>
        </div>
      </div>

      {/* Contract List */}
      <div className="contract-list-section">
        <h2 className="section-title">Lista de Contratos</h2>
        
        <div className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por número de contrato, cliente o vehículo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-filters" onClick={handleFilters}>
            Filtros
          </button>
          <button className="btn-filters" onClick={handleStateFilter}>
            Estado
          </button>
        </div>

        {loading && <div className="no-results"><p>Cargando contratos…</p></div>}
        {error && <div className="no-results"><p style={{ color: 'crimson' }}>{error}</p></div>}
        <div className="contracts-list">
          {filteredContracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              onViewDetails={() => handleViewDetails(contract)}
              onEdit={() => handleEdit(contract)}
              onDelete={() => handleDelete(contract.id)}
            />
          ))}
        </div>

        {filteredContracts.length === 0 && (
          <div className="no-results">
            <p>No se encontraron contratos que coincidan con la búsqueda</p>
          </div>
        )}
      </div>
      {selectedContract && (
        <ContractDetailsModal
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
          onEdit={(c) => { setSelectedContract(null); handleEdit(c); onNavigate?.('crear-contrato'); }}
          onDelete={(id) => { handleDelete(id); setSelectedContract(null); }}
        />
      )}
    </div>
  );
};

export default ContractManagement;
