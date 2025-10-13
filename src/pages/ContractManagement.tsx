import React, { useState } from 'react';
import ContractCard from '../components/ContractCard';
import '../styles/ContractManagement.css';
import type { Contract, ContractStats } from '../types/contract';

const ContractManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const stats: ContractStats = {
    total: 89,
    active: 34,
    expiring: 5,
    monthlyIncome: 45230,
  };

  const contracts: Contract[] = [
    {
      id: '1',
      contractNumber: 'CT-2024-001',
      clientName: 'Juan Pérez García',
      vehicle: 'Toyota Corolla',
      vehiclePlate: 'AQP-123',
      vehicleType: 'Automóvil',
      period: 14,
      total: 12750,
      dailyRate: 850,
      startDate: '2024-03-01',
      endDate: '2024-03-15',
      status: 'Activo',
    },
    {
      id: '2',
      contractNumber: 'CT-2024-002',
      clientName: 'María González López',
      vehicle: 'Nissan Frontier',
      vehiclePlate: 'LIM-456',
      vehicleType: 'Camiones',
      period: 14,
      total: 16800,
      dailyRate: 1200,
      startDate: '2024-02-20',
      endDate: '2024-03-05',
      status: 'Finalizado',
    },
    {
      id: '3',
      contractNumber: 'CT-2024-003',
      clientName: 'Ana Martínez Flores',
      vehicle: 'Caterpillar 730C',
      vehiclePlate: 'CUS-789',
      vehicleType: 'Carga Pesada',
      period: 10,
      total: 18000,
      dailyRate: 1800,
      startDate: '2024-03-10',
      endDate: '2024-03-20',
      status: 'Por Vencer',
    },
    {
      id: '4',
      contractNumber: 'CT-2024-004',
      clientName: 'Carlos Rodríguez Sánchez',
      vehicle: 'Honda CR-V',
      vehiclePlate: 'TRU-012',
      vehicleType: 'Automóvil',
      period: 10,
      total: 8250,
      dailyRate: 750,
      startDate: '2024-03-15',
      endDate: '2024-03-25',
      status: 'Pendiente',
    },
  ];

  const filteredContracts = contracts.filter(contract =>
    contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewContract = () => {
    console.log('Crear nuevo contrato');
  };

  const handleViewDetails = (contractId: string) => {
    console.log('Ver detalles del contrato:', contractId);
  };

  const handleContractMenu = (contractId: string) => {
    console.log('Menú del contrato:', contractId);
  };

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
          <div className="stat-icon">📄</div>
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
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.expiring}</div>
            <div className="stat-label">Por Vencer</div>
          </div>
        </div>

        <div className="stat-card-simple">
          <div className="stat-icon">💰</div>
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
              onViewDetails={() => handleViewDetails(contract.id)}
              onMenuClick={() => handleContractMenu(contract.id)}
            />
          ))}
        </div>

        {filteredContracts.length === 0 && (
          <div className="no-results">
            <p>No se encontraron contratos que coincidan con la búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractManagement;
