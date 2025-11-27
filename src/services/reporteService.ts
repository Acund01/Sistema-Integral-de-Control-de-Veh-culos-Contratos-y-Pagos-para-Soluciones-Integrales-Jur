import api from '../api';

const BASE_PATH = '/reportes';

export type ReportPayload = Record<string, unknown> | FormData | undefined;

function filenameFromContentDisposition(header?: string | null) {
  if (!header) return null;
  const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/.exec(header);
  return match ? decodeURIComponent(match[1] || match[2]) : null;
}

export async function downloadReportExcel(path: string, payload?: ReportPayload) {
  const url = `${BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`;
  const config: any = {
    responseType: 'blob',
    headers: { Accept: 'application/octet-stream' }
  };
  
  let res;
  try {
    if (payload && !(payload instanceof FormData)) {
      res = await api.post(url, payload, config);
    } else if (payload instanceof FormData) {
      res = await api.post(url, payload, config);
    } else {
      res = await api.get(url, config);
    }
  } catch (error: any) {
    const text = error.response ? await error.response.data.text() : error.message;
    throw new Error(`Error al generar reporte: ${error.response?.status} ${error.response?.statusText} ${text}`);
  }

  const blob = res.data;
  const cd = res.headers['content-disposition'];
  const filename = filenameFromContentDisposition(cd) || `reporte-${Date.now()}.xlsx`;
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}

/** Genera un reporte (JSON metadatos o binario) según backend.
 * Si el backend responde con Excel directamente, se fuerza la descarga.
 * Si responde JSON (metadatos + nombreArchivo), se podría luego llamar a descarga.
 */
export async function generateReport(payload: { tipo: string; formato?: string; parametros?: Record<string, unknown>; periodo?: { inicio: string; fin: string } }) {
  // Este endpoint genérico NO existe en el controller actual, se deja para futura ampliación
  const url = `${BASE_PATH}/generar`; // placeholder
  const body = { tipo: payload.tipo, formato: payload.formato || 'xlsx', parametros: payload.parametros || {}, periodo: payload.periodo };
  
  try {
    const res = await api.post(url, body, {
      headers: { Accept: 'application/json,application/octet-stream' },
      responseType: 'blob' // We request blob to handle both cases, but might need to check content type
    });
    
    const ct = res.headers['content-type'] || '';
    if (ct.includes('application/octet-stream') || ct.includes('application/vnd')) {
      // tratar como descarga directa
      const blob = res.data;
      const cd = res.headers['content-disposition'];
      const filename = filenameFromContentDisposition(cd) || `reporte-${Date.now()}.xlsx`;
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
      return { filename };
    } else {
      // Si es JSON, axios lo parsea si responseType no fuera blob.
      // Pero como pusimos blob, tenemos que leerlo.
      const text = await res.data.text();
      return JSON.parse(text);
    }
  } catch (error: any) {
    const text = error.response ? await error.response.data.text() : error.message;
    throw new Error(`Error al generar reporte: ${error.response?.status} ${error.response?.statusText} ${text}`);
  }
}

// === Endpoints reales según ReporteController ===
// Pagos Excel: POST /api/reportes/pagos/excel  { fechaInicio: 'YYYY-MM-DD', fechaFin: 'YYYY-MM-DD' }
export async function generarPagosExcel(fechaInicio: string, fechaFin: string) {
  return downloadReportExcel('/pagos/excel', { fechaInicio, fechaFin });
}

// Uso Vehículos Excel: POST /api/reportes/uso-vehiculos/excel
export async function generarUsoVehiculosExcel(fechaInicio: string, fechaFin: string) {
  return downloadReportExcel('/uso-vehiculos/excel', { fechaInicio, fechaFin });
}

// Ingresos Mensuales Excel: GET /api/reportes/ingresos-mensuales/{anio}/excel
export async function generarIngresosMensualesExcel(anio: number) {
  return downloadReportExcel(`/ingresos-mensuales/${anio}/excel`);
}

// Datos JSON (si se necesitan mostrar antes de exportar)
export async function datosPagos(fechaInicio: string, fechaFin: string) {
  const res = await api.post(`${BASE_PATH}/pagos/datos`, { fechaInicio, fechaFin });
  return res.data;
}
export async function datosUsoVehiculos(fechaInicio: string, fechaFin: string) {
  const res = await api.post(`${BASE_PATH}/uso-vehiculos/datos`, { fechaInicio, fechaFin });
  return res.data;
}
export async function datosIngresosMensuales(anio: number) {
  const res = await api.get(`${BASE_PATH}/ingresos-mensuales/${anio}/datos`);
  return res.data;
}

export async function listGeneratedReports() {
  const res = await api.get(`${BASE_PATH}/generados`);
  return res.data; // [{id, tipo_reporte, nombre_archivo, fecha_generacion, formato, tamaño_bytes}]
}

export async function downloadGeneratedReport(id: string) {
  const res = await api.get(`${BASE_PATH}/generados/${id}/descargar`, {
    responseType: 'blob'
  });
  const blob = res.data;
  const cd = res.headers['content-disposition'];
  const filename = (cd && /filename="?([^"]+)"?/.exec(cd)?.[1]) || `reporte-${id}.xlsx`;
  const urlBlob = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = urlBlob; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(urlBlob);
}
