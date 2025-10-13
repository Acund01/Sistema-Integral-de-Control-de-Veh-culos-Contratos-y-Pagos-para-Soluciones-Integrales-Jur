import React, { useState } from 'react';
import VehicleCard from '../components/VehicleCard';
import '../styles/VehicleManagement.css';
import type { Vehicle, VehicleStats } from '../types/vehicle';

const VehicleManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const stats: VehicleStats = {
    total: 48,
    available: 36,
    rented: 9,
    maintenance: 3,
  };

  const vehicles: Vehicle[] = [
    {
      id: '1',
      brand: 'Toyota',
      model: 'Corolla',
      type: 'Automóvil',
      year: 2023,
      plate: 'AQP-123',
      fuel: 'Gasolina',
      lastMaintenance: '2024-01-15',
      status: 'Disponible',
    },
    {
      id: '2',
      brand: 'Nissan',
      model: 'Frontier',
      type: 'Camiones',
      year: 2022,
      plate: 'LIM-456',
      fuel: 'Diesel',
      lastMaintenance: '2024-02-10',
      status: 'Alquilado',
    },
    {
      id: '3',
      brand: 'Caterpillar',
      model: '730C',
      type: 'Carga Pesada',
      year: 2023,
      plate: 'CUS-789',
      fuel: 'Diesel',
      lastMaintenance: '2024-03-01',
      status: 'Mantenimiento',
    },
    {
      id: '4',
      brand: 'Honda',
      model: 'CR-V',
      type: 'Automóvil',
      year: 2021,
      plate: 'TRU-012',
      fuel: 'Gasolina',
      lastMaintenance: '2024-01-20',
      status: 'Disponible',
    },
    {
      id: '5',
      brand: 'Ford',
      model: 'F-150',
      type: 'Camiones',
      year: 2023,
      plate: 'ICA-345',
      fuel: 'Gasolina',
      lastMaintenance: '2024-03-05',
      status: 'Disponible',
    },
    {
      id: '6',
      brand: 'Volvo',
      model: 'A40G',
      type: 'Carga Pesada',
      year: 2022,
      plate: 'PIU-678',
      fuel: 'Diesel',
      lastMaintenance: '2024-02-28',
      status: 'Disponible',
    },
  ];

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewVehicle = () => {
    console.log('Crear nuevo vehículo');
  };

  const handleViewDetails = (vehicleId: string) => {
    console.log('Ver detalles del vehículo:', vehicleId);
  };

  const handleVehicleMenu = (vehicleId: string) => {
    console.log('Menú del vehículo:', vehicleId);
  };

  const handleFilters = () => {
    console.log('Abrir filtros');
  };

  const handleStateFilter = () => {
    console.log('Filtrar por estado');
  };

  return (
    <div className="vehicle-management">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Gestión de Vehículos</h1>
          <p className="page-subtitle">Administra tu flota de vehículos de alquiler</p>
        </div>
        <button className="btn-primary" onClick={handleNewVehicle}>
          <span className="btn-icon">+</span>
          Nuevo Vehículo
        </button>
      </div>

      {/* Stats Cards */}
      <div className="vehicle-stats">
        <div className="stat-card-simple">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Vehículos</div>
          </div>
        </div>

        <div className="stat-card-simple">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-value">{stats.available}</div>
            <div className="stat-label">Disponibles</div>
          </div>
        </div>

        <div className="stat-card-simple">
          <div className="stat-icon">⏱</div>
          <div className="stat-content">
            <div className="stat-value">{stats.rented}</div>
            <div className="stat-label">Alquilados</div>
          </div>
        </div>

        <div className="stat-card-simple">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.maintenance}</div>
            <div className="stat-label">En Mantenimiento</div>
          </div>
        </div>
      </div>

      {/* Vehicle Inventory */}
      <div className="vehicle-inventory-section">
        <h2 className="section-title">Inventario de Vehículos</h2>
        
        <div className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por marca, modelo, placa..."
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

        <div className="vehicles-grid">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onViewDetails={() => handleViewDetails(vehicle.id)}
              onMenuClick={() => handleVehicleMenu(vehicle.id)}
            />
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="no-results">
            <p>No se encontraron vehículos que coincidan con la búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleManagement;
