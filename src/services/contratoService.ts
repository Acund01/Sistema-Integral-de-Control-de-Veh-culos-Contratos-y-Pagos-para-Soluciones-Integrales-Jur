import type { ContratoRequestDto, ContratoResponseDto } from '../types/contract';

// URL base robusta: si la env está vacía o en blanco, usar proxy '/api/contratos'
const ENV_URL = (import.meta as ImportMeta).env?.VITE_CONTRATOS_BASE_URL as string | undefined;
const API_BASE_URL = ENV_URL && ENV_URL.trim() ? ENV_URL.trim() : '/api/contratos';

class ContratoService {
  /** GET /api/contratos */
  async findAll(): Promise<ContratoResponseDto[]> {
    const res = await fetch(`${API_BASE_URL}`);
    if (!res.ok) throw new Error(`Error al obtener contratos: ${res.status} ${res.statusText}`);
    const data = await res.json();
    // Aceptar varias formas de respuesta: arreglo directo o envuelto (Spring Page u otros)
    type Page<T> = { content: T[] };
    type Items<T> = { items: T[] };
    type DataWrap<T> = { data: T[] };
    const d = data as ContratoResponseDto[] | Page<ContratoResponseDto> | Items<ContratoResponseDto> | DataWrap<ContratoResponseDto> | unknown;
    if (Array.isArray(d)) return d;
    if (d && typeof d === 'object') {
      const obj = d as Record<string, unknown>;
      if (Array.isArray((obj as Page<ContratoResponseDto>).content)) return (obj as Page<ContratoResponseDto>).content;
      if (Array.isArray((obj as Items<ContratoResponseDto>).items)) return (obj as Items<ContratoResponseDto>).items;
      if (Array.isArray((obj as DataWrap<ContratoResponseDto>).data)) return (obj as DataWrap<ContratoResponseDto>).data;
    }
    // Si no es un arreglo reconocible, retornamos vacío para no romper la UI
    return [];
  }

  /** GET /api/contratos/{id} */
  async findById(id: string): Promise<ContratoResponseDto> {
    const res = await fetch(`${API_BASE_URL}/${id}`);
    if (!res.ok) throw new Error(`Error al obtener contrato: ${res.statusText}`);
    return res.json();
  }

  /** POST /api/contratos */
  async create(dto: ContratoRequestDto): Promise<ContratoResponseDto> {
    const res = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Error al crear contrato: ${t}`);
    }
    return res.json();
  }

  /** PUT /api/contratos/{id} */
  async update(id: string, dto: ContratoRequestDto): Promise<ContratoResponseDto> {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Error al actualizar contrato: ${t}`);
    }
    return res.json();
  }

  /** DELETE /api/contratos/{id} */
  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Error al eliminar contrato: ${res.statusText}`);
  }

  /** PUT /api/contratos/{id}/finalizar */
  async finalizar(id: string): Promise<ContratoResponseDto> {
    const res = await fetch(`${API_BASE_URL}/${id}/finalizar`, { method: 'PUT' });
    if (!res.ok) throw new Error(`Error al finalizar contrato: ${res.statusText}`);
    return res.json();
  }

  /** PUT /api/contratos/{id}/cancelar */
  async cancelar(id: string): Promise<ContratoResponseDto> {
    const res = await fetch(`${API_BASE_URL}/${id}/cancelar`, { method: 'PUT' });
    if (!res.ok) throw new Error(`Error al cancelar contrato: ${res.statusText}`);
    return res.json();
  }

  /** POST /api/contratos/rango-fechas */
  async listarPorRangoFechas(fechaInicio: string, fechaFin: string): Promise<ContratoResponseDto[]> {
    const res = await fetch(`${API_BASE_URL}/rango-fechas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fechaInicio, fechaFin }),
    });
    if (!res.ok) throw new Error(`Error al listar contratos por rango de fechas: ${res.statusText}`);
    return res.json();
  }
}

export const contratoService = new ContratoService();
