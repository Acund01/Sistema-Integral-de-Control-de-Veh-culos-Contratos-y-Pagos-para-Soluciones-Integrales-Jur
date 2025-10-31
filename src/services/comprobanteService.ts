
export interface ComprobanteRequestDto {
  idContrato: string;
  tipoComprobante: 'FACTURA' | 'BOLETA';
}

export interface ComprobanteResponseDto {
  idComprobante: string;
  idContrato: string;
  fechaEmision: string; // LocalDateTime ISO
  tipoComprobante: string;
  numeroSerie: string;
  numeroCorrelativo: string;
  subtotal: string; // BigDecimal serializado
  igv: string; // BigDecimal serializado
  total: string; // BigDecimal serializado
  estado: string;
}

const API_BASE_URL = (import.meta as ImportMeta).env?.VITE_COMPROBANTES_BASE_URL ?? '/api/comprobantes';

class ComprobanteService {
  /** POST /api/comprobantes */
  async generar(dto: ComprobanteRequestDto): Promise<ComprobanteResponseDto> {
    const res = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Error al generar comprobante: ${t}`);
    }
    return res.json();
  }

  /** GET /api/comprobantes/contrato/{contratoId} */
  async obtenerPorContrato(contratoId: string): Promise<ComprobanteResponseDto> {
    const res = await fetch(`${API_BASE_URL}/contrato/${contratoId}`);
    if (!res.ok) throw new Error(`Error al obtener comprobante por contrato: ${res.statusText}`);
    return res.json();
  }

  /** GET /api/comprobantes/{comprobanteId}/descargar */
  async descargarPdf(comprobanteId: string): Promise<Blob> {
    const res = await fetch(`${API_BASE_URL}/${comprobanteId}/descargar`);
    if (!res.ok) throw new Error(`Error al descargar PDF: ${res.statusText}`);
    return res.blob();
  }

  /** PUT /api/comprobantes/{comprobanteId}/anular */
  async anular(comprobanteId: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/${comprobanteId}/anular`, { method: 'PUT' });
    if (!res.ok) throw new Error(`Error al anular comprobante: ${res.statusText}`);
  }

  /** POST /api/comprobantes/rango-fechas */
  async listarPorRangoFechas(fechaInicio: string, fechaFin: string): Promise<ComprobanteResponseDto[]> {
    const res = await fetch(`${API_BASE_URL}/rango-fechas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fechaInicio, fechaFin }),
    });
    if (!res.ok) throw new Error(`Error al listar comprobantes por rango de fechas: ${res.statusText}`);
    return res.json();
  }
}

export const comprobanteService = new ComprobanteService();
