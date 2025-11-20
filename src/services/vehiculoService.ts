import type {
  Vehiculo,
  EstadoVehiculo,
  CrearVehiculoDto,
  ActualizarVehiculoDto,
  VehiculoContratoDto,
  VehiculoReporteDto,
  Modelo,
  TipoVehiculo
} from '../types/vehicle';

// URL base del microservicio de vehículos (usar proxy de Vite en dev)
const API_BASE_URL = (import.meta as ImportMeta).env?.VITE_VEHICULOS_BASE_URL ?? '/api/vehiculos';
// Derivar raíz del microservicio para otros catálogos (modelos, tipos)
const API_ROOT = API_BASE_URL.replace(/\/?vehiculos\/?$/, '').replace(/\/$/, '') || '/api';

/**
 * Servicio para consumir el API REST del microservicio de Vehículos
 * Ajustado a controladores típicos: listar, crear, actualizar, eliminar, estado, etc.
 */
class VehiculoService {
  /** GET /api/vehiculos */
  async findAll(): Promise<Vehiculo[]> {
    const res = await fetch(`${API_BASE_URL}`);
    if (!res.ok) throw new Error(`Error al obtener vehículos: ${res.status} ${res.statusText}`);
    return res.json();
  }

  /** GET /api/vehiculos/disponibles */
  async findDisponibles(): Promise<Vehiculo[]> {
    const res = await fetch(`${API_BASE_URL}/disponibles`);
    if (!res.ok) throw new Error(`Error al obtener vehículos disponibles: ${res.statusText}`);
    return res.json();
  }

  /** GET /api/vehiculos/{id} */
  async findById(id: string): Promise<Vehiculo> {
    const res = await fetch(`${API_BASE_URL}/${id}`);
    if (!res.ok) throw new Error(`Error al obtener vehículo ${id}: ${res.statusText}`);
    return res.json();
  }

  /** GET /api/vehiculos/estado/{estado} */
  async listarPorEstado(estado: EstadoVehiculo): Promise<Vehiculo[]> {
    const res = await fetch(`${API_BASE_URL}/estado/${estado}`);
    if (!res.ok) throw new Error(`Error al listar por estado: ${res.statusText}`);
    return res.json();
  }

  /** POST /api/vehiculos */
  async create(dto: CrearVehiculoDto): Promise<Vehiculo> {
    const res = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Error al crear vehículo: ${t}`);
    }
    return res.json();
  }

  /** PUT /api/vehiculos/{id} */
  async update(id: string, dto: ActualizarVehiculoDto): Promise<Vehiculo> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Error al actualizar vehículo: ${t}`);
    }
    return res.json();
  }

  /** DELETE /api/vehiculos/{id} */
  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Error al eliminar vehículo ${id}: ${res.statusText}`);
  }

  /** PUT /api/vehiculos/{id}/restore - Restaurar (activar) vehículo previamente desactivado */
  async restore(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/${id}/restore`, { method: 'PUT' });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Error al restaurar vehículo ${id}: ${res.status} ${res.statusText} - ${t}`);
    }
  }

  /** Cambiar activo/inactivo usando delete (soft) y restore */
  async setActivo(id: string, activo: boolean): Promise<void> {
    if (activo) {
      return this.restore(id);
    } else {
      return this.delete(id);
    }
  }

  /** GET /api/vehiculos/contratos/{id} - para integrarse con contratos */
  async obtenerParaContrato(id: string): Promise<VehiculoContratoDto> {
    const res = await fetch(`${API_BASE_URL}/contratos/${id}`);
    if (!res.ok) throw new Error(`Error al obtener vehículo para contrato: ${res.statusText}`);
    return res.json();
  }

  /** PATCH|PUT /api/vehiculos/{id}/estado/{estado} (o body) */
  async actualizarEstado(id: string, estado: EstadoVehiculo): Promise<Vehiculo> {
    // Intentamos una ruta común con path param; si tu backend usa body, ajusta aquí
    const res = await fetch(`${API_BASE_URL}/${id}/estado/${estado}`, { method: 'PUT' });
    if (!res.ok) throw new Error(`Error al actualizar estado: ${res.statusText}`);
    return res.json();
  }

  /** POST /api/vehiculos/reportes/por-ids */
  async obtenerVehiculosParaReportes(ids: string[]): Promise<VehiculoReporteDto[]> {
    const res = await fetch(`${API_BASE_URL}/reportes/por-ids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ids),
    });
    if (!res.ok) throw new Error(`Error al obtener vehículos para reportes: ${res.statusText}`);
    return res.json();
  }

  /** GET /api/modelos - listado de modelos con su marca */
  async listarModelos(): Promise<Modelo[]> {
    const res = await fetch(`${API_ROOT}/modelos`);
    if (!res.ok) throw new Error(`Error al obtener modelos: ${res.status} ${res.statusText}`);
    return res.json();
  }

  /** GET /api/tipos-vehiculo - listado de tipos de vehículo */
  async listarTiposVehiculo(): Promise<TipoVehiculo[]> {
    const res = await fetch(`${API_ROOT}/tipos-vehiculo`);
    if (!res.ok) throw new Error(`Error al obtener tipos de vehículo: ${res.status} ${res.statusText}`);
    return res.json();
  }
}

export const vehiculoService = new VehiculoService();
