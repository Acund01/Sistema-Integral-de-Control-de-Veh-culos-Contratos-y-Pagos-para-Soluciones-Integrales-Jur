import React, { useEffect, useMemo, useState } from 'react';
import VehicleCard from '../components/VehicleCard';
import VehicleDetailsModal from '../components/VehicleDetailsModal';
import '../styles/VehicleManagement.css';
import type { Vehicle, VehicleStats } from '../types/vehicle';


interface VehicleManagementProps {
  startAdding?: boolean;
  vehicles?: Vehicle[];
  onAddVehicle?: (vehicle: Vehicle) => void;
  onUpdateVehicle?: (id: string, patch: Partial<Vehicle>) => void;
  onDeleteVehicle?: (id: string) => void;
}

const VehicleManagement: React.FC<VehicleManagementProps> = ({ startAdding = false, vehicles, onAddVehicle, onUpdateVehicle, onDeleteVehicle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

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

  // Inventario base de ejemplo
  const baseVehicles: Vehicle[] = [
    
  ];

  // Estado del inventario mostrado (permite agregar nuevos vehículos)
  const [items, setItems] = useState<Vehicle[]>(vehicles ?? baseVehicles);

  // Si recibimos vehículos por props, sincronizamos con el estado local
  useEffect(() => {
    if (vehicles) setItems(vehicles);
  }, [vehicles]);

  // Cálculo de estadísticas a partir del inventario actual
  const stats: VehicleStats = useMemo(() => {
    const total = items.length;
    const available = items.filter(v => v.status === 'Disponible').length;
    const rented = items.filter(v => v.status === 'Alquilado').length;
    const maintenance = items.filter(v => v.status === 'Mantenimiento').length;
    return { total, available, rented, maintenance };
  }, [items]);

  const filteredVehicles = items.filter(vehicle =>
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
    if (editingVehicleId) {
      // actualizar vehículo existente
      const patch: Partial<Vehicle> = {
        brand: newVehicle.brand || undefined,
        model: newVehicle.model || undefined,
        type: newVehicle.type || undefined,
        year: parseInt(newVehicle.year, 10) || undefined,
        plate: newVehicle.plate || undefined,
        fuel: newVehicle.fuel || undefined,
      };
      if (onUpdateVehicle) {
        onUpdateVehicle(editingVehicleId, patch);
      } else {
        setItems(prev => prev.map(v => v.id === editingVehicleId ? { ...v, ...patch } as Vehicle : v));
      }
    } else {
      // Crear vehículo nuevo y agregarlo al inventario mostrado
      const vehicleToAdd: Vehicle = {
        id: Date.now().toString(),
        brand: newVehicle.brand || 'Sin marca',
        model: newVehicle.model || 'Sin modelo',
        type: newVehicle.type || 'Automóvil',
        year: parseInt(newVehicle.year, 10) || new Date().getFullYear(),
        plate: newVehicle.plate || '',
        fuel: newVehicle.fuel || '',
        lastMaintenance: new Date().toISOString().slice(0, 10),
        status: 'Disponible',
      };
      if (onAddVehicle) {
        onAddVehicle(vehicleToAdd);
      } else {
        setItems((prev) => [vehicleToAdd, ...prev]);
      }
    }
    setIsAdding(false);
    setEditingVehicleId(null);
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

  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    if (onDeleteVehicle) {
      onDeleteVehicle(vehicleId);
    } else {
      setItems(prev => prev.filter(v => v.id !== vehicleId));
    }
  };

  const handleStartEditVehicle = (vehicle: Vehicle) => {
    setIsAdding(true);
    setEditingVehicleId(vehicle.id);
    setNewVehicle({
      brand: vehicle.brand,
      model: vehicle.model,
      year: String(vehicle.year),
      plate: vehicle.plate,
      type: vehicle.type,
      fuel: vehicle.fuel,
      description: '',
    });
  };

  const handleChangeStatus = (id: string, status: Vehicle['status']) => {
    if (onUpdateVehicle) {
      onUpdateVehicle(id, { status });
    } else {
      setItems(prev => prev.map(v => v.id === id ? { ...v, status } : v));
    }
    setSelectedVehicle(prev => (prev && prev.id === id ? { ...prev, status } : prev));
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
              
              <h1 className="page-title">{editingVehicleId ? 'Editar Vehículo' : 'Agregar Nuevo Vehículo'}</h1>
              <p className="page-subtitle">{editingVehicleId ? 'Actualiza la información del vehículo' : 'Completa la información del vehículo para agregarlo al inventario'}</p>
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
              <button type="submit" className="btn-primary">{editingVehicleId ? 'Guardar Cambios' : 'Guardar Vehículo'}</button>
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
              <div className="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-car-suv" width="36" height="36" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M5 17a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path>
                    <path d="M16 17a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"></path>
                    <path d="M5 9l2 -4h7.438a2 2 0 0 1 1.94 1.515l.622 2.485h3a2 2 0 0 1 2 2v3"></path>
                    <path d="M10 9v-4"></path>
                    <path d="M2 7v4"></path>
                    <path d="M22.001 14.001a4.992 4.992 0 0 0 -4.001 -2.001a4.992 4.992 0 0 0 -4 2h-3a4.998 4.998 0 0 0 -8.003 .003"></path>
                    <path d="M5 12v-3h13"></path>
                </svg>
              </div>
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
              <div className="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-calendar-time" width="36" height="36" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M11.795 21h-6.795a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v4"></path>
                    <path d="M18 18m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"></path>
                    <path d="M15 3v4"></path>
                    <path d="M7 3v4"></path>
                    <path d="M3 11h16"></path>
                    <path d="M18 16.496v1.504l1 1"></path>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.rented}</div>
                <div className="stat-label">Alquilados</div>
              </div>
            </div>

            <div className="stat-card-simple">
              <div className="stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-urgent" width="36" height="36" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M8 16v-4a4 4 0 0 1 8 0v4"></path>
                    <path d="M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7"></path>
                    <path d="M6 16m0 1a1 1 0 0 1 1 -1h10a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1z"></path>
                </svg>
              </div>
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
                  onViewDetails={() => handleViewDetails(vehicle)}
                  onEditVehicle={() => handleStartEditVehicle(vehicle)}
                  onDeleteVehicle={() => handleDeleteVehicle(vehicle.id)}
                />
              ))}
            </div>

            {filteredVehicles.length === 0 && (
              <div className="no-results">
                <p>No se encontraron vehículos que coincidan con la búsqueda</p>
              </div>
            )}
          </div>
          {selectedVehicle && (
            <VehicleDetailsModal
              vehicle={selectedVehicle}
              onClose={() => setSelectedVehicle(null)}
              onEdit={(v) => { setSelectedVehicle(null); handleStartEditVehicle(v); }}
              onDelete={(id) => { handleDeleteVehicle(id); setSelectedVehicle(null); }}
              onChangeStatus={handleChangeStatus}
            />
          )}
        </>
      )}
    </div>
  );
};

export default VehicleManagement;
