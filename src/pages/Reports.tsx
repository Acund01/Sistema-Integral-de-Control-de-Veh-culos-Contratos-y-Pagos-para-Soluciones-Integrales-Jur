import React, { useEffect, useState } from 'react';
import ReportCard from '../components/ReportCard';
import '../styles/Reports.css';
import { generarPagosExcel, generarUsoVehiculosExcel, generarIngresosMensualesExcel } from '../services/reporteService';
import { datosIngresosMensuales } from '../services/reporteService';
import { clienteService } from '../services/clienteService';
import { vehiculoService } from '../services/vehiculoService';
import { contratoService } from '../services/contratoService';
import { activityService } from '../services/activityService';
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
  const [clientsCount, setClientsCount] = useState<number>(0);
  const [vehiclesTotal, setVehiclesTotal] = useState<number>(0);
  const [activeContracts, setActiveContracts] = useState<number>(0);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [ingresosMensuales, setIngresosMensuales] = useState<Array<{ mes: string; total: number }>>([]);

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

  // Cargar métricas y datos para gráficos
  useEffect(() => {
    const load = async () => {
      try {
        const [clientes, vehiculos, contratos] = await Promise.all([
          clienteService.findAll().catch(() => []),
          vehiculoService.findAll().catch(() => []),
          contratoService.findAll().catch(() => []),
        ]);
        type ClienteLike = { activo?: boolean };
        const clientesArr: ClienteLike[] = Array.isArray(clientes) ? (clientes as unknown as ClienteLike[]) : [];
        setClientsCount(clientesArr.filter((c) => c?.activo !== false).length);
        const totalVeh = Array.isArray(vehiculos) ? vehiculos.length : 0;
        setVehiclesTotal(totalVeh);

        // Contratos activos por fecha
        const today = new Date();
        const clamp = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
        type ContratoLike = { estado?: string; fechaInicio?: string | Date; fechaFin?: string | Date; detalles?: Array<{ precioDiario?: number }> };
        const contratosArr: ContratoLike[] = Array.isArray(contratos) ? (contratos as unknown as ContratoLike[]) : [];
        const activos = contratosArr.filter((c) => {
          const estado = (c?.estado ?? '').toString().toUpperCase();
          if (estado === 'FINALIZADO' || estado === 'CANCELADO') return false;
          const fin = new Date(c?.fechaFin || Date.now());
          return clamp(fin) >= clamp(today);
        }).length;
        setActiveContracts(activos);

        // Ingresos del mes (prorrateado similar al Dashboard)
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        const clampDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const daysBetweenInclusive = (a: Date, b: Date) => Math.max(0, Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        const ingreso = contratosArr.reduce((acc: number, c: ContratoLike) => {
          const start = clampDate(new Date(c?.fechaInicio || Date.now()));
          const end = clampDate(new Date(c?.fechaFin || Date.now()));
          const startOverlap = start < monthStart ? monthStart : start;
          const endOverlap = end > monthEnd ? monthEnd : end;
          if (endOverlap < monthStart || startOverlap > monthEnd) return acc;
          const days = daysBetweenInclusive(startOverlap, endOverlap);
          const precioDiario = Number(c?.detalles?.[0]?.precioDiario || 0);
          return acc + days * precioDiario;
        }, 0);
        setMonthlyIncome(ingreso);
      } catch {
        // dejar valores por defecto
      }
    };
    load();
  }, []);

  // Datos para el gráfico de ingresos mensuales según año seleccionado
  useEffect(() => {
    datosIngresosMensuales(year)
      .then((rows: unknown[]) => {
        type IngresoRow = { mes?: string; month?: string | number; nombreMes?: string; total?: number; totalIngresos?: number; monto?: number };
        const parsed = (rows || []).map((ru: unknown) => {
          const r = ru as IngresoRow;
          const mes = r?.mes ?? r?.nombreMes ?? (typeof r?.month === 'number' ? String(r?.month) : r?.month) ?? '';
          const total = Number(r?.total ?? r?.totalIngresos ?? r?.monto ?? 0);
          return { mes: String(mes), total };
        });
        setIngresosMensuales(parsed);
      })
      .catch(() => setIngresosMensuales([]));
  }, [year]);

  const handleDownload = async (r: RealReport) => {
    try {
      setDownloadingId(r.id);
      if (r.kind === 'pagos' || r.kind === 'uso-vehiculos') {
        const { inicio, fin } = periodoFechas();
        if (r.kind === 'pagos') {
          await generarPagosExcel(inicio, fin);
          activityService.log(`Descargaste reporte de Pagos (${inicio} a ${fin})`);
        } else {
          await generarUsoVehiculosExcel(inicio, fin);
          activityService.log(`Descargaste reporte de Uso de Vehículos (${inicio} a ${fin})`);
        }
      } else if (r.kind === 'ingresos-mensuales') {
        await generarIngresosMensualesExcel(year);
        activityService.log(`Descargaste reporte de Ingresos Mensuales (${year})`);
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
    activityService.log('Generaste todos los reportes para el período seleccionado');
    alert('Generación masiva completada');
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Reportes y Análisis</h1>
          <p className="page-subtitle">Genera reportes y analiza el rendimiento del negocio</p>
        </div>
      </div>

      {/* Stats superiors */}
      <div className="reports-stats">
        <div className="stat-card-report">
          <div className="stat-label">Ingresos Este Mes</div>
          <div className="stat-value">S/. {monthlyIncome.toLocaleString()}</div>
          <div className="stat-change positive"><span className="change-arrow">↗</span><span className="change-text">+15%</span></div>
        </div>
        <div className="stat-card-report">
          <div className="stat-label">Contratos Activos</div>
          <div className="stat-value">{activeContracts}</div>
          <div className="stat-change positive"><span className="change-arrow">↗</span><span className="change-text">+8%</span></div>
        </div>
        <div className="stat-card-report">
          <div className="stat-label">Ocupación Promedio</div>
          <div className="stat-value">{vehiclesTotal ? Math.round((activeContracts / Math.max(vehiclesTotal,1)) * 100) : 0}%</div>
          <div className="stat-change positive"><span className="change-arrow">↗</span><span className="change-text">+5%</span></div>
        </div>
        <div className="stat-card-report">
          <div className="stat-label">Clientes Nuevos</div>
          <div className="stat-value">{clientsCount}</div>
          <div className="stat-change positive"><span className="change-arrow">↗</span><span className="change-text">+12%</span></div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-section">
        <div className="chart-card">
          <h3 className="chart-title"><span className="chart-icon">📊</span>Ingresos Mensuales</h3>
          <div className="chart-container">
            {(ingresosMensuales.length ? ingresosMensuales : [
              { mes: 'Ene', total: 0 }, { mes: 'Feb', total: 0 }, { mes: 'Mar', total: 0 }
            ]).slice(0, 12).map((row, idx) => {
              const max = Math.max(1, ...ingresosMensuales.map(r => r.total));
              const h = Math.max(10, Math.round((row.total / max) * 140));
              return (
                <div className="chart-bar-wrapper" key={idx}>
                  <div className="chart-bar-container">
                    <div className="chart-bar income-bar" style={{ height: `${h}px` }} />
                  </div>
                  <div className="chart-value">S/. {Math.round(row.total).toLocaleString()}</div>
                  <div className="chart-label">{row.mes}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="chart-card">
          <h3 className="chart-title"><span className="chart-icon">📄</span>Contratos por Mes</h3>
          <div className="chart-container">
            {[{ label: 'Ene', v: 28 }, { label: 'Feb', v: 32 }, { label: 'Mar', v: 34 }].map((c, idx) => (
              <div className="chart-bar-wrapper" key={idx}>
                <div className="chart-bar-container">
                  <div className="chart-bar contracts-bar" style={{ height: `${20 + c.v}px` }} />
                </div>
                <div className="chart-value">{c.v} contratos</div>
                <div className="chart-label">{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="report-filters period-config-section">
        <h3 className="section-title"><span className="section-icon">🗓</span>Configuración de Período</h3>
        <p className="section-subtitle">Selecciona el período de tiempo que se aplicará a todos los reportes</p>
        <label>
          <span className="period-label">Período de Análisis</span>
          <select className="period-select" value={periodo} onChange={(e) => setPeriodo(e.target.value as typeof periodo)}>
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
        <div className="period-info"><span className="info-icon">📅</span>Aplicará a: {periodo.replace('-', ' ')}</div>
        <button className="btn-generate-all" onClick={handleGenerateAll} disabled={!!generatingId || !!downloadingId}>
          <span className="btn-icon">📊</span>
          Generar Todos los Reportes - Último mes
        </button>
      </div>
      <div className="generate-reports-section">
        <h3 className="section-title">Generar Reportes</h3>
        <p className="section-subtitle">Todos los reportes se generarán con el período seleccionado arriba</p>
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
    </div>
  );
};

export default Reports;
