import React, { useState } from 'react';
import ReportCard from '../components/ReportCard';
import '../styles/Reports.css';
import { generarPagosExcel, generarUsoVehiculosExcel, generarIngresosMensualesExcel } from '../services/reporteService';
import type { ReportType } from '../types/report';

interface RealReport extends ReportType {
  kind: 'pagos' | 'uso-vehiculos' | 'ingresos-mensuales';
  endpointExcel: string;
  needsYear?: boolean;
}

const Reports: React.FC = () => {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [periodo, setPeriodo] = useState<'mensual' | 'trimestral' | 'semestral' | 'anual'>('mensual');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const reports: RealReport[] = [
    {
      id: 'pagos',
      kind: 'pagos',
      title: 'Reporte de Pagos',
      description: 'Pagos realizados en el período seleccionado.',
      icon: '💰',
      endpointExcel: '/pagos/excel',
      lastGenerated: '-',
      period: 'seleccionado'
    },
    {
      id: 'uso-vehiculos',
      kind: 'uso-vehiculos',
      title: 'Reporte de Uso de Vehículos',
      description: 'Uso y actividad de la flota en el período.',
      icon: '🚗',
      endpointExcel: '/uso-vehiculos/excel',
      lastGenerated: '-',
      period: 'seleccionado'
    },
    {
      id: 'ingresos-mensuales',
      kind: 'ingresos-mensuales',
      title: 'Reporte de Ingresos Mensuales',
      description: 'Resumen de ingresos por mes para el año indicado.',
      icon: '📈',
      endpointExcel: `/ingresos-mensuales/${year}/excel`,
      needsYear: true,
      lastGenerated: '-',
      period: 'año actual'
    }
  ];

  const periodoFechas = () => {
    const ahora = new Date();
    const añoActual = ahora.getFullYear();
    let inicio: Date;
    const fin: Date = new Date(ahora);
    switch (periodo) {
      case 'mensual': inicio = new Date(añoActual, ahora.getMonth(), 1); break;
      case 'trimestral': inicio = new Date(añoActual, ahora.getMonth() - 2, 1); break;
      case 'semestral': inicio = new Date(añoActual, ahora.getMonth() - 5, 1); break;
      case 'anual': default: inicio = new Date(añoActual, 0, 1); break;
    }
    return { inicio: inicio.toISOString().substring(0, 10), fin: fin.toISOString().substring(0, 10) };
  };

  const handleDownload = async (r: RealReport) => {
    try {
      setDownloadingId(r.id);
      if (r.kind === 'pagos' || r.kind === 'uso-vehiculos') {
        const { inicio, fin } = periodoFechas();
        if (r.kind === 'pagos') await generarPagosExcel(inicio, fin);
        else await generarUsoVehiculosExcel(inicio, fin);
      } else if (r.kind === 'ingresos-mensuales') {
        await generarIngresosMensualesExcel(year);
      }
    } catch (e) {
      alert((e as Error).message || 'Error al descargar');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleGenerate = async (r: RealReport) => {
    try {
      setGeneratingId(r.id);
      await handleDownload(r); // reutiliza misma lógica
    } catch (e) {
      alert((e as Error).message || 'Error al generar');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleGenerateAll = async () => {
    for (const r of reports) {
      await handleGenerate(r);
    }
    alert('Generación masiva completada');
  };

  return (
    <div className="reports-page">
      <h2>Reportes</h2>
      <div className="report-filters">
        <label>
          Período:
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value as typeof periodo)}>
            <option value="mensual">Mensual</option>
            <option value="trimestral">Trimestral</option>
            <option value="semestral">Semestral</option>
            <option value="anual">Anual</option>
          </select>
        </label>
        <label>
          Año ingresos mensuales:
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
            min={2000}
            max={2100}
          />
        </label>
        <button className="btn-secondary" onClick={handleGenerateAll} disabled={!!generatingId || !!downloadingId}>Generar Todos</button>
      </div>
      <div className="reports-grid">
        {reports.map(r => (
          <ReportCard
            key={r.id}
            report={r}
            onDownload={() => handleDownload(r)}
            onGenerate={() => handleGenerate(r)}
            downloading={downloadingId === r.id}
            generating={generatingId === r.id}
          />
        ))}
      </div>
    </div>
  );
};

export default Reports;
