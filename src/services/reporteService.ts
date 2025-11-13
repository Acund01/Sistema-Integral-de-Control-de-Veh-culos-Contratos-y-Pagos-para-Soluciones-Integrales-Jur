const ENV_URL = (import.meta as any).env?.VITE_REPORTES_BASE_URL as string | undefined;
const API_BASE_URL = ENV_URL && ENV_URL.trim() ? ENV_URL.trim() : '/api/reportes';

export type ReportPayload = Record<string, unknown> | FormData | undefined;

function filenameFromContentDisposition(header?: string | null) {
  if (!header) return null;
  const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/.exec(header);
  return match ? decodeURIComponent(match[1] || match[2]) : null;
}

export async function downloadReportExcel(path: string, payload?: ReportPayload) {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const opts: RequestInit = {
    method: payload ? 'POST' : 'GET',
    headers: { Accept: 'application/octet-stream' }
  };
  if (payload && !(payload instanceof FormData)) {
    (opts.headers as Record<string,string>)['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(payload);
  } else if (payload instanceof FormData) {
    opts.body = payload;
  }
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text().catch(()=> '');
    throw new Error(`Error al generar reporte: ${res.status} ${res.statusText} ${text}`);
  }
  const blob = await res.blob();
  const cd = res.headers.get('Content-Disposition');
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
  const url = `${API_BASE_URL}/generar`; // placeholder
  const body = { tipo: payload.tipo, formato: payload.formato || 'xlsx', parametros: payload.parametros || {}, periodo: payload.periodo };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json,application/octet-stream' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Error al generar reporte: ${res.status} ${res.statusText} ${text}`);
  }
  const ct = res.headers.get('Content-Type') || '';
  if (ct.includes('application/octet-stream') || ct.includes('application/vnd')) {
    // tratar como descarga directa
    const blob = await res.blob();
    const cd = res.headers.get('Content-Disposition');
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
  }
  // asumir JSON metadatos
  return res.json();
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
  const res = await fetch(`${API_BASE_URL}/pagos/datos`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ fechaInicio, fechaFin }) });
  if (!res.ok) throw new Error('Error datos pagos');
  return res.json();
}
export async function datosUsoVehiculos(fechaInicio: string, fechaFin: string) {
  const res = await fetch(`${API_BASE_URL}/uso-vehiculos/datos`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ fechaInicio, fechaFin }) });
  if (!res.ok) throw new Error('Error datos uso vehiculos');
  return res.json();
}
export async function datosIngresosMensuales(anio: number) {
  const res = await fetch(`${API_BASE_URL}/ingresos-mensuales/${anio}/datos`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Error datos ingresos mensuales');
  return res.json();
}

export async function listGeneratedReports() {
  const res = await fetch(`${API_BASE_URL}/generados`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Error al listar: ${res.status}`);
  return res.json(); // [{id, tipo_reporte, nombre_archivo, fecha_generacion, formato, tamaño_bytes}]
}

export async function downloadGeneratedReport(id: string) {
  const res = await fetch(`${API_BASE_URL}/generados/${id}/descargar`, { headers: { Accept: 'application/octet-stream' } });
  if (!res.ok) throw new Error(`Error al descargar: ${res.status}`);
  const blob = await res.blob();
  const cd = res.headers.get('Content-Disposition');
  const filename = (cd && /filename="?([^"]+)"?/.exec(cd)?.[1]) || `reporte-${id}.xlsx`;
  const urlBlob = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = urlBlob; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(urlBlob);
}
