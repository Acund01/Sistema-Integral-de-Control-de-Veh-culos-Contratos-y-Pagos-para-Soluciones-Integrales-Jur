import React, { useEffect, useState } from 'react';
import VehicleCard from '../components/VehicleCard';
import '../styles/VehicleManagement.css';
import type { Vehicle, VehicleStats } from '../types/vehicle';

interface VehicleManagementProps {
  startAdding?: boolean;
}

const VehicleManagement: React.FC<VehicleManagementProps> = ({ startAdding = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  interface NewVehicleForm {
    brand: string;
    model: string;
    year: string;
    plate: string;
    type: string;
    fuel: string;
    description: string;
  }

  const [newVehicle, setNewVehicle] = useState<NewVehicleForm>({
    brand: '',
    model: '',
    year: new Date().getFullYear().toString(),
    plate: '',
    type: '',
    fuel: '',
    description: '',
  });

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
    setIsAdding(true);
  };

  useEffect(() => {
    if (startAdding) setIsAdding(true);
  }, [startAdding]);

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewVehicle((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Guardar vehículo:', newVehicle);
    // Aquí se enviaría al backend
    // por ahora volver a la vista principal
    setIsAdding(false);
    // limpiar formulario
    setNewVehicle({ brand: '', model: '', year: new Date().getFullYear().toString(), plate: '', type: '', fuel: '', description: '' });
  };

  const handleAddCancel = () => {
    setIsAdding(false);
  };

  const typeDescriptions: Record<string, string> = {
    'Automóvil': 'Vehículos ligeros de uso personal (SUV, hatchback, sedan)',
    'Camioneta': 'Vehículos tipo pickup o SUV de mayor capacidad',
    'Camiones': 'Camiones de plataforma, pick-ups',
    'Carga Pesada': 'Tractores, volquetes, cargadores',
  };

  const fuelDescriptions: Record<string, string> = {
    'Gasolina': 'Motores a gasolina convencionales',
    'Diesel': 'Motores diésel para mayor eficiencia en carga',
    'Electrico': 'Vehículos 100% eléctricos',
    'Híbrido': 'Combinación de motor eléctrico y combustión',
    'GLP': 'Gas licuado de petróleo',
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
      {isAdding ? (
        <div className="form-card">
          <div className="page-header">
            <div className="header-content">
              
              <h1 className="page-title">Agregar Nuevo Vehículo</h1>
              <p className="page-subtitle">Completa la información del vehículo para agregarlo al inventario</p>
            </div>
          </div>

          <form className="form-section" onSubmit={handleAddSubmit}>
            <h3 className="section-title">Información del Vehículo</h3>
            <div className="field-row">
              <div className="field-col">
                <label>Marca *</label>
                <input name="brand" value={newVehicle.brand} onChange={handleAddChange} placeholder="Ej: Toyota, Honda, Nissan" />
              </div>
              <div className="field-col">
                <label>Modelo *</label>
                <input name="model" value={newVehicle.model} onChange={handleAddChange} placeholder="Ej: Corolla, Civic, Sentra" />
              </div>
            </div>

            <div className="field-row">
              <div className="field-col">
                <label>Año *</label>
                <input name="year" value={newVehicle.year} onChange={handleAddChange} />
              </div>
              <div className="field-col">
                <label>Placa *</label>
                <input name="plate" value={newVehicle.plate} onChange={handleAddChange} placeholder="AQP-123" />
              </div>
            </div>

            <div className="field-row">
              <div className="field-col-full">
                <label>Tipo de Vehículo *</label>
                <select name="type" value={newVehicle.type} onChange={handleAddChange}>
                  <option value="">Seleccionar tipo de vehículo</option>
                  <option value="Automóvil">Automóvil</option>
                  <option value="Camioneta">Camioneta</option>
                  <option value="Camiones">Camiones</option>
                  <option value="Carga Pesada">Carga Pesada</option>
                </select>
                {newVehicle.type && (
                  <div className="select-description">{typeDescriptions[newVehicle.type]}</div>
                )}
              </div>
            </div>

            <div className="field-row">
              <div className="field-col-full">
                <label>Tipo de Combustible</label>
                <select name="fuel" value={newVehicle.fuel} onChange={handleAddChange}>
                  <option value="">Seleccionar combustible</option>
                  <option value="Gasolina">Gasolina</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Híbrido">Híbrido</option>
                  <option value="Electrico">Eléctrico</option>
                  <option value="GLP">GLP</option>
                </select>
                {newVehicle.fuel && (
                  <div className="select-description">{fuelDescriptions[newVehicle.fuel]}</div>
                )}
              </div>
            </div>

            <div className="field-row">
              <div className="field-col-full">
                <label>Descripción Adicional</label>
                <textarea name="description" value={newVehicle.description} onChange={handleAddChange} placeholder="Detalles adicionales del vehículo, características especiales, etc." />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={handleAddCancel}>Cancelar</button>
              <button type="submit" className="btn-primary">Guardar Vehículo</button>
            </div>
          </form>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default VehicleManagement;
