import type {
  ClienteUnion,
  ClienteNatural,
  ClienteEmpresa,
  ClienteNaturalDto,
  ClienteEmpresaDto,
  ClienteContratoDto,
  ClienteReporteDto
} from '../types/client';

// URL base del microservicio de clientes (usar proxy de Vite en dev)
const API_BASE_URL = (import.meta as ImportMeta).env?.VITE_CLIENTES_BASE_URL ?? '/api/clientes';

/**
 * Servicio para consumir el API REST del microservicio de Clientes
 * Coincide con los endpoints definidos en ClienteController.java
 */
class ClienteService {
  
  /**
   * GET /api/clientes - Listar todos los clientes
   */
  async findAll(): Promise<ClienteUnion[]> {
    const response = await fetch(`${API_BASE_URL}`);
    if (!response.ok) {
      throw new Error(`Error al obtener clientes: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * GET /api/clientes/activos - Listar clientes activos
   */
  async findAllActivos(): Promise<ClienteUnion[]> {
    const response = await fetch(`${API_BASE_URL}/activos`);
    if (!response.ok) {
      throw new Error(`Error al obtener clientes activos: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * GET /api/clientes/inactivos - Listar clientes inactivos
   */
  async findAllInactivos(): Promise<ClienteUnion[]> {
    const response = await fetch(`${API_BASE_URL}/inactivos`);
    if (!response.ok) {
      throw new Error(`Error al obtener clientes inactivos: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * GET /api/clientes/{id} - Buscar cliente por ID
   */
  async findById(id: string): Promise<ClienteUnion> {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`Error al obtener cliente ${id}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * GET /api/clientes/naturales/{id} - Obtener cliente natural con todos sus campos
   */
  async findNaturalById(id: string): Promise<ClienteNatural> {
    const response = await fetch(`${API_BASE_URL}/naturales/${id}`);
    if (!response.ok) {
      throw new Error(`Error al obtener cliente natural ${id}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * GET /api/clientes/empresas/{id} - Obtener cliente empresa con todos sus campos
   */
  async findEmpresaById(id: string): Promise<ClienteEmpresa> {
    const response = await fetch(`${API_BASE_URL}/empresas/${id}`);
    if (!response.ok) {
      throw new Error(`Error al obtener cliente empresa ${id}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * POST /api/clientes/naturales - Crear cliente natural
   */
  async createNatural(dto: ClienteNaturalDto): Promise<ClienteNatural> {
    const response = await fetch(`${API_BASE_URL}/naturales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al crear cliente natural: ${errorText}`);
    }
    return response.json();
  }

  /**
   * PUT /api/clientes/naturales/{id} - Actualizar cliente natural
   */
  async updateNatural(id: string, dto: ClienteNaturalDto): Promise<ClienteNatural> {
    const response = await fetch(`${API_BASE_URL}/naturales/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al actualizar cliente natural: ${errorText}`);
    }
    return response.json();
  }

  /**
   * POST /api/clientes/empresas - Crear cliente empresa
   */
  async createEmpresa(dto: ClienteEmpresaDto): Promise<ClienteEmpresa> {
    const response = await fetch(`${API_BASE_URL}/empresas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al crear cliente empresa: ${errorText}`);
    }
    return response.json();
  }

  /**
   * PUT /api/clientes/empresas/{id} - Actualizar cliente empresa
   */
  async updateEmpresa(id: string, dto: ClienteEmpresaDto): Promise<ClienteEmpresa> {
    const response = await fetch(`${API_BASE_URL}/empresas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al actualizar cliente empresa: ${errorText}`);
    }
    return response.json();
  }

  /**
   * DELETE /api/clientes/{id} - Desactivar cliente (soft delete)
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Error al eliminar cliente ${id}: ${response.statusText}`);
    }
  }

  /**
   * PATCH /api/clientes/{id}/restaurar - Restaurar / reactivar cliente inactivo
   * Si tu backend usa otra ruta (p.ej. /activar), ajusta aquí.
   */
  async restore(id: string): Promise<void> {
    // Endpoint real según ClienteController: PUT /api/clientes/{id} (sin body, 204)
    const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'PUT' });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Error al restaurar cliente ${id}: ${response.status} ${response.statusText} - ${text}`);
    }
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
    const response = await fetch(`${API_BASE_URL}/contratos/${id}`);
    if (!response.ok) {
      throw new Error(`Error al obtener cliente para contrato: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * POST /api/clientes/reportes/por-ids - Obtener clientes para reportes
   */
  async obtenerClientesParaReportes(ids: string[]): Promise<ClienteReporteDto[]> {
    const response = await fetch(`${API_BASE_URL}/reportes/por-ids`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ids),
    });
    if (!response.ok) {
      throw new Error(`Error al obtener clientes para reportes: ${response.statusText}`);
    }
    return response.json();
  }
}

// Exportar instancia única del servicio
export const clienteService = new ClienteService();
