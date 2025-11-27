import api from '../api';
import type {
  ClienteUnion,
  ClienteNatural,
  ClienteEmpresa,
  ClienteNaturalDto,
  ClienteEmpresaDto,
  ClienteContratoDto,
  ClienteReporteDto
} from '../types/client';

const BASE_PATH = '/clientes';

/**
 * Servicio para consumir el API REST del microservicio de Clientes
 * Coincide con los endpoints definidos en ClienteController.java
 */
class ClienteService {
  
  /**
   * GET /api/clientes - Listar todos los clientes
   */
  async findAll(): Promise<ClienteUnion[]> {
    const response = await api.get(BASE_PATH);
    return response.data;
  }

  /**
   * GET /api/clientes/activos - Listar clientes activos
   */
  async findAllActivos(): Promise<ClienteUnion[]> {
    const response = await api.get(`${BASE_PATH}/activos`);
    return response.data;
  }

  /**
   * GET /api/clientes/inactivos - Listar clientes inactivos
   */
  async findAllInactivos(): Promise<ClienteUnion[]> {
    const response = await api.get(`${BASE_PATH}/inactivos`);
    return response.data;
  }

  /**
   * GET /api/clientes/{id} - Buscar cliente por ID
   */
  async findById(id: string): Promise<ClienteUnion> {
    const response = await api.get(`${BASE_PATH}/${id}`);
    return response.data;
  }

  /**
   * GET /api/clientes/naturales/{id} - Obtener cliente natural con todos sus campos
   */
  async findNaturalById(id: string): Promise<ClienteNatural> {
    const response = await api.get(`${BASE_PATH}/naturales/${id}`);
    return response.data;
  }

  /**
   * GET /api/clientes/empresas/{id} - Obtener cliente empresa con todos sus campos
   */
  async findEmpresaById(id: string): Promise<ClienteEmpresa> {
    const response = await api.get(`${BASE_PATH}/empresas/${id}`);
    return response.data;
  }

  /**
   * POST /api/clientes/naturales - Crear cliente natural
   */
  async createNatural(dto: ClienteNaturalDto): Promise<ClienteNatural> {
    const response = await api.post(`${BASE_PATH}/naturales`, dto);
    return response.data;
  }

  /**
   * PUT /api/clientes/naturales/{id} - Actualizar cliente natural
   */
  async updateNatural(id: string, dto: ClienteNaturalDto): Promise<ClienteNatural> {
    const response = await api.put(`${BASE_PATH}/naturales/${id}`, dto);
    return response.data;
  }

  /**
   * POST /api/clientes/empresas - Crear cliente empresa
   */
  async createEmpresa(dto: ClienteEmpresaDto): Promise<ClienteEmpresa> {
    const response = await api.post(`${BASE_PATH}/empresas`, dto);
    return response.data;
  }

  /**
   * PUT /api/clientes/empresas/{id} - Actualizar cliente empresa
   */
  async updateEmpresa(id: string, dto: ClienteEmpresaDto): Promise<ClienteEmpresa> {
    const response = await api.put(`${BASE_PATH}/empresas/${id}`, dto);
    return response.data;
  }

  /**
   * DELETE /api/clientes/{id} - Desactivar cliente (soft delete)
   */
  async delete(id: string): Promise<void> {
    await api.delete(`${BASE_PATH}/${id}`);
  }

  /**
   * DELETE definitivo /api/clientes/permanente/{id} - Elimina físicamente el cliente.
   */
  async purge(id: string): Promise<void> {
    await api.delete(`${BASE_PATH}/permanente/${id}`);
  }

  /**
   * Eliminación definitiva con fallback: intenta purge; si el endpoint no existe (404) o no soportado,
   * recurre a delete (soft). Úsalo para "Eliminar para siempre" en UI.
   */
  async permanentDelete(id: string): Promise<void> {
    try {
      await this.purge(id);
    } catch (e: unknown) {
      // Si falla por 404/405 intentamos el delete normal
      // @ts-expect-error - Axios error structure
      if (e.response && (e.response.status === 404 || e.response.status === 405)) {
        await this.delete(id);
      } else {
        throw e;
      }
    }
  }

  /**
   * PATCH /api/clientes/{id}/restaurar - Restaurar / reactivar cliente inactivo
   */
  async restore(id: string): Promise<void> {
    // Endpoint real según ClienteController: PUT /api/clientes/{id} (sin body, 204)
    await api.put(`${BASE_PATH}/${id}`);
  }

  /**
   * Cambiar estado (activar/desactivar) usando estrategia unificada.
   * Intentará desactivar con DELETE y activar con restore.
   */
  async setActivo(id: string, activo: boolean): Promise<void> {
    if (activo) {
      return this.restore(id);
    } else {
      return this.delete(id);
    }
  }

  /**
   * GET /api/clientes/contratos/{id} - Obtener cliente para contrato (Feign client)
   */
  async obtenerParaContrato(id: string): Promise<ClienteContratoDto> {
    const response = await api.get(`${BASE_PATH}/contratos/${id}`);
    return response.data;
  }

  /**
   * POST /api/clientes/reportes/por-ids - Obtener clientes para reportes
   */
  async obtenerClientesParaReportes(ids: string[]): Promise<ClienteReporteDto[]> {
    const response = await api.post(`${BASE_PATH}/reportes/por-ids`, ids);
    return response.data;
  }
}

// Exportar instancia única del servicio
export const clienteService = new ClienteService();
