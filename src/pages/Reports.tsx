import React, { useState } from 'react';
import ReportCard from '../components/ReportCard';
import { generarPagosExcel, generarUsoVehiculosExcel, generarIngresosMensualesExcel } from '../services/reporteService';
import '../styles/Reports.css';
import type { ReportStats, MonthlyData, ReportType } from '../types/report';

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('ultimo-mes');
  // genLoading eliminado (no se usa porque generación descarga directo)

  const stats: ReportStats = {
    monthlyIncome: 45230,
    incomeChange: '+15%',
    activeContracts: 34,
    contractsChange: '+8%',
    averageOccupancy: 78,
    occupancyChange: '+5%',
    newClients: 12,
    clientsChange: '+12%',
  };

  const monthlyIncomeData: MonthlyData[] = [
    { month: 'Ene', income: 35000, contracts: 28 },
    { month: 'Feb', income: 38000, contracts: 32 },
    { month: 'Mar', income: 45230, contracts: 34 },
  ];

  const reports: ReportType[] = [
    {
      id: 'pagos',
      title: 'Reporte de Pagos',
      description: 'Detalle de pagos realizados por período',
      icon: '💳',
      lastGenerated: '-',
      period: 'seleccionado',
      tipo: 'PAGOS',
      formato: 'xlsx'
    },
    {
      id: 'uso-vehiculos',
      title: 'Reporte de Uso de Vehículos',
      description: 'Estado y utilización de la flota en el período',
      icon: '🚗',
      lastGenerated: '-',
      period: 'seleccionado',
      tipo: 'USO_VEHICULOS',
      formato: 'xlsx'
    },
    {
      id: 'ingresos-mensuales',
      title: 'Reporte de Ingresos Mensuales',
      description: 'Ingresos agrupados por mes del año actual',
      icon: '💰',
      lastGenerated: '-',
      period: 'año actual',
      tipo: 'INGRESOS_MENSUALES',
      formato: 'xlsx'
    }
  ];

  // Traducir período seleccionado a rango de fechas ISO (simplificado)
  const periodoFechas = () => {
    const hoy = new Date();
    const end = hoy.toISOString().slice(0,10);
    const d = new Date(hoy);
    switch(selectedPeriod){
      case 'ultimos-3-meses': d.setMonth(d.getMonth()-3); break;
      case 'ultimos-6-meses': d.setMonth(d.getMonth()-6); break;
      case 'ultimo-ano': d.setFullYear(d.getFullYear()-1); break;
      default: d.setMonth(d.getMonth()-1); // ultimo-mes
    }
    const start = d.toISOString().slice(0,10);
    return { inicio: start, fin: end };
  };

  const handleDownload = async (reportId: string) => {
    const rango = periodoFechas();
    try {
      if(reportId==='pagos') return generarPagosExcel(rango.inicio, rango.fin);
      if(reportId==='uso-vehiculos') return generarUsoVehiculosExcel(rango.inicio, rango.fin);
      if(reportId==='ingresos-mensuales') return generarIngresosMensualesExcel(new Date().getFullYear());
      alert('Reporte sin endpoint Excel en backend');
    } catch(e){
      alert((e as Error).message);
    }
  };

  const handleGenerate = async (reportId: string) => {
    // En los endpoints actuales la generación ya produce y descarga el Excel.
    // Podemos reutilizar handleDownload para 'generar'.
    await handleDownload(reportId);
  };

  const handleGenerateAll = async () => {
    for(const r of reports){
      await handleDownload(r.id);
    }
  };

  const getMaxValue = (data: MonthlyData[], key: 'income' | 'contracts') => {
    return Math.max(...data.map(item => item[key]));
  };

  const getBarHeight = (value: number, maxValue: number) => {
    return `${(value / maxValue) * 100}%`;
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Reportes y Análisis</h1>
          <p className="page-subtitle">Genera reportes y analiza el rendimiento del negocio</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="reports-stats">
        <div className="stat-card-report">
          <div className="stat-label">Ingresos Este Mes</div>
          <div className="stat-value">S/. {stats.monthlyIncome.toLocaleString()}</div>
          <div className="stat-change positive">
            <span className="change-arrow">↗</span>
            <span>{stats.incomeChange}</span>
          </div>
        </div>

        <div className="stat-card-report">
          <div className="stat-label">Contratos Activos</div>
          <div className="stat-value">{stats.activeContracts}</div>
          <div className="stat-change positive">
            <span className="change-arrow">↗</span>
            <span>{stats.contractsChange}</span>
          </div>
        </div>

        <div className="stat-card-report">
          <div className="stat-label">Ocupación Promedio</div>
          <div className="stat-value">{stats.averageOccupancy}%</div>
          <div className="stat-change positive">
            <span className="change-arrow">↗</span>
            <span>{stats.occupancyChange}</span>
          </div>
        </div>

        <div className="stat-card-report">
          <div className="stat-label">Clientes Nuevos</div>
          <div className="stat-value">{stats.newClients}</div>
          <div className="stat-change positive">
            <span className="change-arrow">↗</span>
            <span>{stats.clientsChange}</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <h3 className="chart-title">
            <span className="chart-icon">📊</span>
            Ingresos Mensuales
          </h3>
          <div className="chart-container">
            {monthlyIncomeData.map((data) => (
              <div key={data.month} className="chart-bar-wrapper">
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar income-bar"
                    style={{ height: getBarHeight(data.income, getMaxValue(monthlyIncomeData, 'income')) }}
                  ></div>
                </div>
                <div className="chart-value">S/. {data.income.toLocaleString()}</div>
                <div className="chart-label">{data.month}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">
            <span className="chart-icon">📄</span>
            Contratos por Mes
          </h3>
          <div className="chart-container">
            {monthlyIncomeData.map((data) => (
              <div key={data.month} className="chart-bar-wrapper">
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar contracts-bar"
                    style={{ height: getBarHeight(data.contracts, getMaxValue(monthlyIncomeData, 'contracts')) }}
                  ></div>
                </div>
                <div className="chart-value">{data.contracts} contratos</div>
                <div className="chart-label">{data.month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Period Configuration */}
      <div className="period-config-section">
        <h3 className="section-title">
          <span className="section-icon">📅</span>
          Configuración de Período
        </h3>
        <p className="section-subtitle">Selecciona el período de tiempo que se aplicará a todos los reportes</p>
        
        <div className="period-selector">
          <label className="period-label">Período de Análisis</label>
          <select 
            className="period-select"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="ultimo-mes">Último mes</option>
            <option value="ultimos-3-meses">Últimos 3 meses</option>
            <option value="ultimos-6-meses">Últimos 6 meses</option>
            <option value="ultimo-ano">Último año</option>
            <option value="personalizado">Personalizado</option>
          </select>
          <span className="period-info">
            <span className="info-icon">📅</span>
            Aplicará a: último mes
          </span>
        </div>
      </div>

      {/* Generate Reports Section */}
      <div className="generate-reports-section">
        <h3 className="section-title">Generar Reportes</h3>
        <p className="section-subtitle">Todos los reportes se generarán con el período seleccionado arriba</p>
        
        <div className="reports-grid">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onDownload={() => handleDownload(report.id)}
              onGenerate={() => handleGenerate(report.id)}
            />
          ))}
        </div>

        <button className="btn-generate-all" onClick={handleGenerateAll}>
          <span className="btn-icon">📊</span>
          Generar Todos los Reportes - Último mes
        </button>
      </div>
    </div>
  );
};

export default Reports;
