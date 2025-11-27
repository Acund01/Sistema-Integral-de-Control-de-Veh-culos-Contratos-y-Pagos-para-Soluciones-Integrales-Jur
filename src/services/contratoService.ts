import api from '../api';
import type { ContratoRequestDto, ContratoResponseDto } from '../types/contract';

const BASE_PATH = '/contratos';

class ContratoService {
  /** GET /api/contratos */
  async findAll(): Promise<ContratoResponseDto[]> {
    const res = await api.get(BASE_PATH);
    const data = res.data;
    
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
    const res = await api.get(`${BASE_PATH}/${id}`);
    return res.data;
  }

  /** POST /api/contratos */
  async create(dto: ContratoRequestDto): Promise<ContratoResponseDto> {
    const res = await api.post(BASE_PATH, dto);
    return res.data;
  }

  /** PUT /api/contratos/{id} */
  async update(id: string, dto: ContratoRequestDto): Promise<ContratoResponseDto> {
    const res = await api.put(`${BASE_PATH}/${id}`, dto);
    return res.data;
  }

  /** DELETE /api/contratos/{id} */
  async delete(id: string): Promise<void> {
    await api.delete(`${BASE_PATH}/${id}`);
  }

  /** PUT /api/contratos/{id}/finalizar */
  async finalizar(id: string): Promise<ContratoResponseDto> {
    const res = await api.put(`${BASE_PATH}/${id}/finalizar`);
    return res.data;
  }

  /** PUT /api/contratos/{id}/cancelar */
  async cancelar(id: string): Promise<ContratoResponseDto> {
    const res = await api.put(`${BASE_PATH}/${id}/cancelar`);
    return res.data;
  }

  /** POST /api/contratos/rango-fechas */
  async listarPorRangoFechas(fechaInicio: string, fechaFin: string): Promise<ContratoResponseDto[]> {
    const res = await api.post(`${BASE_PATH}/rango-fechas`, { fechaInicio, fechaFin });
    return res.data;
  }
}

export const contratoService = new ContratoService();
