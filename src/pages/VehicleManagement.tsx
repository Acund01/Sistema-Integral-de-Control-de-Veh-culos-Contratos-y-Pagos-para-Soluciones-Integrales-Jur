import React, { useEffect, useMemo, useState } from 'react';
import VehicleCard from '../components/VehicleCard';
import VehicleDetailsModal from '../components/VehicleDetailsModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import '../styles/VehicleManagement.css';
import type { Vehiculo, VehicleStats, EstadoVehiculo, TipoCombustible, CrearVehiculoDto, ActualizarVehiculoDto, Modelo, Marca, TipoVehiculo as TipoVehiculoEntity } from '../types/vehicle';
import { vehiculoService } from '../services/vehiculoService';


interface VehicleManagementProps {
  startAdding?: boolean;
  vehicles?: Vehiculo[];
  onAddVehicle?: (vehicle: Vehiculo) => void;
  onUpdateVehicle?: (id: string, patch: Partial<Vehiculo>) => void;
  onDeleteVehicle?: (id: string) => void;
}

const VehicleManagement: React.FC<VehicleManagementProps> = ({ startAdding = false, vehicles, onAddVehicle, onUpdateVehicle, onDeleteVehicle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehiculo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [tiposVehiculo, setTiposVehiculo] = useState<TipoVehiculoEntity[]>([]);
  const [catalogsLoading, setCatalogsLoading] = useState<boolean>(false);
  const [catalogsError, setCatalogsError] = useState<string | null>(null);
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

  interface NewVehicleForm {
    placa: string;
    marcaId: string;
    modeloId: string;
    tipoVehiculoId: string;
    anioFabricacion: string;
    combustible: '' | TipoCombustible;
    descripcion: string;
    imagen: File | null;
  }

  const [newVehicle, setNewVehicle] = useState<NewVehicleForm>({
    placa: '',
    marcaId: '',
    modeloId: '',
    tipoVehiculoId: '',
    anioFabricacion: new Date().getFullYear().toString(),
    combustible: '',
    descripcion: '',
    imagen: null,
  });

  // Estado del inventario mostrado
  const [items, setItems] = useState<Vehiculo[]>(vehicles ?? []);

  // Si recibimos vehículos por props, sincronizamos con el estado local
  useEffect(() => {
    if (vehicles) {
      setItems(vehicles);
    }
  }, [vehicles]);

  // Cargar desde API
  useEffect(() => {
    if (!vehicles) {
      setLoading(true);
      setError(null);
      vehiculoService.findAll()
        .then(data => setItems(data))
        .catch(err => setError(err.message || 'Error al cargar vehículos'))
        .finally(() => setLoading(false));
    }
  }, [vehicles]);

  // Cargar catálogos de Modelos, Marcas y Tipos de Vehículo
  useEffect(() => {
    setCatalogsLoading(true);
    setCatalogsError(null);
    Promise.allSettled([
      vehiculoService.listarModelos().then(setModelos),
      vehiculoService.listarMarcas().then(setMarcas),
      vehiculoService.listarTiposVehiculo().then(setTiposVehiculo),
    ])
      .then((results) => {
        const rejected = results.find(r => r.status === 'rejected');
        if (rejected) setCatalogsError('No se pudieron cargar algunos catálogos');
      })
      .finally(() => setCatalogsLoading(false));
  }, []);

  // Filtrar modelos según la marca seleccionada
  const filteredModelos = useMemo(() => {
    if (!newVehicle.marcaId) return [];
    // Aseguramos que la comparación sea robusta (string vs string)
    return modelos.filter(m => m.marca?.id && String(m.marca.id) === String(newVehicle.marcaId));
  }, [modelos, newVehicle.marcaId]);

  // Cálculo de estadísticas a partir del inventario actual
  const stats: VehicleStats = useMemo(() => {
    const total = items.length;
    // Solo contar como disponibles los vehículos que están activos Y en estado disponible
    const available = items.filter(v => v.activo && v.estado === 'DISPONIBLE').length;
    const rented = items.filter(v => v.estado === 'ALQUILADO').length;
    // Los vehículos inactivos o en mantenimiento se cuentan como mantenimiento
    const maintenance = items.filter(v => !v.activo || v.estado === 'MANTENIMIENTO').length;
    return { total, available, rented, maintenance };
  }, [items]);

  const filteredVehicles = items.filter(vehicle => {
    const t = searchTerm.toLowerCase();
    return (
      vehicle.modelo?.marca?.nombre?.toLowerCase().includes(t) ||
      vehicle.modelo?.nombre?.toLowerCase().includes(t) ||
      vehicle.placa?.toLowerCase().includes(t) ||
      vehicle.tipoVehiculo?.nombre?.toLowerCase().includes(t)
    );
  });

  const handleNewVehicle = () => {
    setIsAdding(true);
  };

  useEffect(() => {
    if (startAdding) setIsAdding(true);
  }, [startAdding]);

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewVehicle((prev) => {
      if (name === 'marcaId') {
        return { ...prev, marcaId: value, modeloId: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewVehicle(prev => ({ ...prev, imagen: e.target.files![0] }));
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVehicleId) {
        const dto: ActualizarVehiculoDto = {
          placa: newVehicle.placa,
          modeloId: newVehicle.modeloId,
          tipoVehiculoId: newVehicle.tipoVehiculoId,
          anioFabricacion: parseInt(newVehicle.anioFabricacion, 10),
          combustible: newVehicle.combustible as TipoCombustible,
          descripcion: newVehicle.descripcion || undefined,
        };
        if (onUpdateVehicle) {
          onUpdateVehicle(editingVehicleId, dto as unknown as Partial<Vehiculo>);
        } else {
          let updated = await vehiculoService.update(editingVehicleId, dto);
          
          // Si hay nueva imagen, subirla
          if (newVehicle.imagen) {
            try {
              updated = await vehiculoService.uploadImage(editingVehicleId, newVehicle.imagen);
            } catch (imgErr) {
              console.error("Error actualizando imagen", imgErr);
            }
          }

          setItems(prev => prev.map(v => v.id === editingVehicleId ? updated : v));
        }
      } else {
        const dto: CrearVehiculoDto = {
          placa: newVehicle.placa,
          modeloId: newVehicle.modeloId,
          tipoVehiculoId: newVehicle.tipoVehiculoId,
          anioFabricacion: parseInt(newVehicle.anioFabricacion, 10),
          combustible: newVehicle.combustible as TipoCombustible,
          descripcion: newVehicle.descripcion || undefined,
          imagen: newVehicle.imagen || undefined,
        };
        if (onAddVehicle) {
          // Si un padre quiere manejarlo, se lo pasamos (necesitará recargar)
          // @ts-expect-error compatibilidad externa
          onAddVehicle(dto);
        } else {
          // 1. Crear el vehículo (JSON)
          const created = await vehiculoService.create(dto);
          
          // 2. Si hay imagen, subirla (Multipart)
          if (dto.imagen) {
            try {
              const updatedWithImage = await vehiculoService.uploadImage(created.id, dto.imagen);
              setItems((prev) => [updatedWithImage, ...prev]);
            } catch (imgErr) {
              console.error("Error subiendo imagen", imgErr);
              // Si falla la imagen, mostramos el vehículo creado pero sin imagen
              setItems((prev) => [created, ...prev]);
              // Opcional: Notificar al usuario que la imagen falló
            }
          } else {
            setItems((prev) => [created, ...prev]);
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo guardar el vehículo';
      setConfirmDialog({
        isOpen: true,
        title: 'Error',
        message: msg,
        type: 'danger',
        onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
      });
    }
    setIsAdding(false);
    setEditingVehicleId(null);
    // limpiar formulario
    setNewVehicle({ placa: '', marcaId: '', modeloId: '', tipoVehiculoId: '', anioFabricacion: new Date().getFullYear().toString(), combustible: '', descripcion: '', imagen: null });
  };

  const handleAddCancel = () => {
    setIsAdding(false);
  };

  // (Opcional) Se pueden cargar catálogos de modelos/tipos con endpoints dedicados si están disponibles

  const handleViewDetails = (vehicle: Vehiculo) => {
    setSelectedVehicle(vehicle);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    const vehicle = items.find(v => v.id === vehicleId);
    const vehicleName = vehicle ? `${vehicle.modelo?.marca?.nombre || ''} ${vehicle.modelo?.nombre || ''}`.trim() : 'este vehículo';
    const isActive = vehicle?.activo ?? true;
    
    setConfirmDialog({
      isOpen: true,
      title: isActive ? 'Desactivar vehículo' : 'Eliminar vehículo',
      message: `¿${isActive ? 'Desactivar' : 'Eliminar definitivamente'} el vehículo ${vehicleName}? ${isActive ? '' : 'Esta acción no se puede deshacer.'}`,
      type: 'danger',
      onConfirm: () => {
        if (onDeleteVehicle) {
          onDeleteVehicle(vehicleId);
        } else {
          vehiculoService.purge(vehicleId)
            .then(async () => {
              setConfirmDialog({
                isOpen: true,
                title: 'Éxito',
                message: 'Vehículo eliminado definitivamente',
                type: 'success',
                onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
              });
              // Recargar lista
              try {
                const data = await vehiculoService.findAll();
                setItems(data);
              } catch (e) {
                // fallback: eliminar localmente
                setItems(prev => prev.filter(v => v.id !== vehicleId));
              }
            })
            .catch(err => {
              setConfirmDialog({
                isOpen: true,
                title: 'Error',
                message: err?.message || 'No se pudo eliminar el vehículo',
                type: 'danger',
                onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
              });
            });
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleChangeActivo = async (id: string, activo: boolean) => {
    setConfirmDialog({
      isOpen: true,
      title: `${activo ? 'Activar' : 'Inactivar'} vehículo`,
      message: `¿Está seguro de ${activo ? 'activar' : 'inactivar'} este vehículo?`,
      type: 'warning',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await vehiculoService.setActivo(id, activo);
          setConfirmDialog({
            isOpen: true,
            title: 'Éxito',
            message: `Vehículo ${activo ? 'activado' : 'desactivado'} correctamente`,
            type: 'success',
            onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
          });
          const data = await vehiculoService.findAll();
          setItems(data);
          setSelectedVehicle(null);
        } catch (e) {
          setConfirmDialog({
            isOpen: true,
            title: 'Error',
            message: `Error al cambiar estado de activación: ${e instanceof Error ? e.message : 'Error desconocido'}`,
            type: 'danger',
            onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
          });
        }
      },
    });
  };

  const handleStartEditVehicle = (vehicle: Vehiculo) => {
    setIsAdding(true);
    setEditingVehicleId(vehicle.id);
    setNewVehicle({
      placa: vehicle.placa,
      modeloId: vehicle.modelo?.id || '',
      tipoVehiculoId: vehicle.tipoVehiculo?.id || '',
      anioFabricacion: String(vehicle.anioFabricacion),
      combustible: vehicle.combustible,
      descripcion: vehicle.descripcion || '',
    });
  };

  const handleChangeStatus = (id: string, status: EstadoVehiculo) => {
    if (onUpdateVehicle) {
      onUpdateVehicle(id, { estado: status } as Partial<Vehiculo>);
    } else {
      vehiculoService.actualizarEstado(id, status)
        .then((updated) => {
          setItems(prev => prev.map(v => v.id === id ? updated : v));
          setSelectedVehicle(prev => (prev && prev.id === id ? updated : prev));
        })
        .catch(err => {
          setConfirmDialog({
            isOpen: true,
            title: 'Error',
            message: err?.message || 'No se pudo actualizar el estado',
            type: 'danger',
            onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
          });
        });
    }
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
                <select name="marcaId" value={newVehicle.marcaId} onChange={handleAddChange} required>
                  <option value="">Seleccionar marca</option>
                  {marcas.map((m) => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="field-col">
                <label>Modelo *</label>
                <select 
                  name="modeloId" 
                  value={newVehicle.modeloId} 
                  onChange={handleAddChange} 
                  required
                  disabled={!newVehicle.marcaId}
                >
                  <option value="">{newVehicle.marcaId ? 'Seleccionar modelo' : 'Seleccione una marca primero'}</option>
                  {filteredModelos.map((m) => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field-row">
              <div className="field-col">
                <label>Tipo de Vehículo *</label>
                <select name="tipoVehiculoId" value={newVehicle.tipoVehiculoId} onChange={handleAddChange} required>
                  <option value="">Seleccionar tipo de vehículo</option>
                  {tiposVehiculo.map((t) => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="field-col">
                <label>Año *</label>
                <input name="anioFabricacion" value={newVehicle.anioFabricacion} onChange={handleAddChange} />
              </div>
            </div>

            <div className="field-row">
              <div className="field-col">
                <label>Placa *</label>
                <input name="placa" value={newVehicle.placa} onChange={handleAddChange} placeholder="AQP-123" />
              </div>
              <div className="field-col">
                <label>Tipo de Combustible</label>
                <select name="combustible" value={newVehicle.combustible} onChange={handleAddChange}>
                  <option value="">Seleccionar combustible</option>
                  <option value="GASOLINA">Gasolina</option>
                  <option value="DIESEL">Diésel</option>
                  <option value="HIBRIDO">Híbrido</option>
                  <option value="ELECTRICO">Eléctrico</option>
                  <option value="GLP">GLP</option>
                </select>
              </div>
            </div>

            <div className="field-row">
              <div className="field-col-full">
                <label>Imagen del Vehículo</label>
                <div className="file-upload-wrapper">
                  <input 
                    type="file" 
                    id="vehicle-image" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="file-input-hidden" 
                  />
                  <label htmlFor="vehicle-image" className="file-upload-label">
                    <div className="upload-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                    </div>
                    <span className="upload-text">
                      {newVehicle.imagen ? newVehicle.imagen.name : 'Haz clic para subir una imagen'}
                    </span>
                  </label>
                  {newVehicle.imagen && (
                    <div className="image-preview">
                      <img src={URL.createObjectURL(newVehicle.imagen)} alt="Vista previa" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="field-row">
              <div className="field-col-full">
                <label>Descripción Adicional</label>
                <textarea name="descripcion" value={newVehicle.descripcion} onChange={handleAddChange} placeholder="Detalles adicionales del vehículo, características especiales, etc." />
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

          {(loading || catalogsLoading) && (
            <div className="no-results"><p>Cargando vehículos…</p></div>
          )}
          {(error || catalogsError) && (
            <div className="no-results"><p style={{ color: 'crimson' }}>{error}</p></div>
          )}

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
              onChangeActivo={handleChangeActivo}
            />
          )}
        </>
      )}
      
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

export default VehicleManagement;
