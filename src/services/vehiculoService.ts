import api from '../api';
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

const BASE_PATH = '/vehiculos';
// Derivar raíz del microservicio para otros catálogos (modelos, tipos)
// Asumiendo que api.ts ya tiene la baseURL configurada, usamos rutas relativas
const ROOT_PATH = ''; 

/**
 * Servicio para consumir el API REST del microservicio de Vehículos
 * Ajustado a controladores típicos: listar, crear, actualizar, eliminar, estado, etc.
 */
class VehiculoService {
  /** GET /api/vehiculos */
  async findAll(): Promise<Vehiculo[]> {
    const res = await api.get(BASE_PATH);
    return res.data;
  }

  /** GET /api/vehiculos/disponibles */
  async findDisponibles(): Promise<Vehiculo[]> {
    const res = await api.get(`${BASE_PATH}/disponibles`);
    return res.data;
  }

  /** GET /api/vehiculos/{id} */
  async findById(id: string): Promise<Vehiculo> {
    const res = await api.get(`${BASE_PATH}/${id}`);
    return res.data;
  }

  /** GET /api/vehiculos/estado/{estado} */
  async listarPorEstado(estado: EstadoVehiculo): Promise<Vehiculo[]> {
    const res = await api.get(`${BASE_PATH}/estado/${estado}`);
    return res.data;
  }

  /** POST /api/vehiculos */
  async create(dto: CrearVehiculoDto): Promise<Vehiculo> {
    // El backend espera JSON en el cuerpo (@RequestBody)
    const vehiculoDto = {
      placa: dto.placa,
      modeloId: Number(dto.modeloId),
      tipoVehiculoId: Number(dto.tipoVehiculoId),
      anioFabricacion: Number(dto.anioFabricacion),
      combustible: dto.combustible,
      descripcion: dto.descripcion
    };
    const res = await api.post(BASE_PATH, vehiculoDto);
    return res.data;
  }

  /** PUT /api/vehiculos/{id}/imagen */
  async uploadImage(id: string, file: File): Promise<Vehiculo> {
    const formData = new FormData();
    formData.append('file', file); // El backend espera @RequestParam("file")
    const res = await api.put(`${BASE_PATH}/${id}/imagen`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }

  /** PUT /api/vehiculos/{id} */
  async update(id: string, dto: ActualizarVehiculoDto): Promise<Vehiculo> {
    const vehiculoDto = {
      placa: dto.placa,
      modeloId: Number(dto.modeloId),
      tipoVehiculoId: Number(dto.tipoVehiculoId),
      anioFabricacion: Number(dto.anioFabricacion),
      combustible: dto.combustible,
      descripcion: dto.descripcion
    };
    const res = await api.put(`${BASE_PATH}/${id}`, vehiculoDto);
    return res.data;
  }

  /** DELETE /api/vehiculos/{id} */
  async delete(id: string): Promise<void> {
    await api.delete(`${BASE_PATH}/${id}`);
  }

  /** DELETE /api/vehiculos/permanente/{id} - Eliminación definitiva */
  async purge(id: string): Promise<void> {
    await api.delete(`${BASE_PATH}/permanente/${id}`);
  }

  /** PUT /api/vehiculos/{id}/restore - Restaurar (activar) vehículo previamente desactivado */
  async restore(id: string): Promise<void> {
    await api.put(`${BASE_PATH}/${id}/restore`);
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
    const res = await api.get(`${BASE_PATH}/contratos/${id}`);
    return res.data;
  }

  /** PATCH|PUT /api/vehiculos/{id}/estado/{estado} (o body) */
  async actualizarEstado(id: string, estado: EstadoVehiculo): Promise<Vehiculo> {
    // Intentamos una ruta común con path param; si tu backend usa body, ajusta aquí
    const res = await api.put(`${BASE_PATH}/${id}/estado/${estado}`);
    return res.data;
  }

  /** POST /api/vehiculos/reportes/por-ids */
  async obtenerVehiculosParaReportes(ids: string[]): Promise<VehiculoReporteDto[]> {
    const res = await api.post(`${BASE_PATH}/reportes/por-ids`, ids);
    return res.data;
  }

  /** GET /api/modelos - listado de modelos con su marca */
  async listarModelos(): Promise<Modelo[]> {
    const res = await api.get(`${ROOT_PATH}/modelos`);
    return res.data;
  }

  /** GET /api/marcas - listado de marcas */
  async listarMarcas(): Promise<Marca[]> {
    const res = await api.get(`${ROOT_PATH}/marcas`);
    return res.data;
  }

  /** GET /api/tipos-vehiculo - listado de tipos de vehículo */
  async listarTiposVehiculo(): Promise<TipoVehiculo[]> {
    const res = await api.get(`${ROOT_PATH}/tipos-vehiculo`);
    return res.data;
  }
}

export const vehiculoService = new VehiculoService();
