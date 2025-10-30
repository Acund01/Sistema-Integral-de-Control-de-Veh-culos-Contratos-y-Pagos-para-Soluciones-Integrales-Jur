import React, { useMemo, useState } from 'react';
import ContractCard from '../components/ContractCard';
import ContractDetailsModal from '../components/ContractDetailsModal';
import '../styles/ContractManagement.css';
import type { Contract, ContractStats } from '../types/contract';

interface ContractManagementProps {
  onNavigate?: (menuId: string) => void;
  contracts?: Contract[];
  onDeleteContract?: (id: string) => void;
  onStartEditContract?: (contract: Contract) => void;
}

const ContractManagement: React.FC<ContractManagementProps> = ({ onNavigate, contracts = [], onDeleteContract, onStartEditContract }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  // Cálculo de estadísticas dinámicas según contratos recibidos
  const stats: ContractStats = useMemo(() => {
    const total = contracts.length;
    const today = new Date();
    const clamp = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const active = contracts.filter(c => c.status === 'Activo' && clamp(new Date(c.endDate)) >= clamp(today)).length;

    // Por vencer: estado 'Por Vencer' o fin dentro de 30 días
    const now = new Date();
    const in30 = new Date(now);
    in30.setDate(in30.getDate() + 30);
    const expiring = contracts.filter(c => {
      if (c.status === 'Por Vencer') return true;
      const end = new Date(c.endDate);
      return end >= now && end <= in30 && (c.status === 'Activo' || c.status === 'Pendiente');
    }).length;

    // Ingresos del mes actual (prorrateado por días dentro del mes)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0); // último día del mes

    const clampDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const daysBetweenInclusive = (a: Date, b: Date) => Math.max(0, Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const monthlyIncome = contracts.reduce((acc, c) => {
      const start = clampDate(new Date(c.startDate));
      const end = clampDate(new Date(c.endDate));
      const startOverlap = start < monthStart ? monthStart : start;
      const endOverlap = end > monthEnd ? monthEnd : end;
      if (endOverlap < monthStart || startOverlap > monthEnd) return acc;
      const days = daysBetweenInclusive(startOverlap, endOverlap);
      return acc + days * (c.dailyRate || 0);
    }, 0);

    return { total, active, expiring, monthlyIncome };
  }, [contracts]);

  // La lista de contratos proviene de la prop `contracts` (por defecto vacía)
  

  const filteredContracts = contracts.filter(contract =>
    contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewContract = () => {
    onNavigate?.('crear-contrato');
  };

  const handleViewDetails = (contract: Contract) => setSelectedContract(contract);
  const handleDelete = (id: string) => onDeleteContract?.(id);
  const handleEdit = (contract: Contract) => onStartEditContract?.(contract);

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
