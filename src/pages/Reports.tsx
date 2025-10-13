import React, { useState } from 'react';
import ReportCard from '../components/ReportCard';
import '../styles/Reports.css';
import type { ReportStats, MonthlyData, ReportType } from '../types/report';

const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('ultimo-mes');

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
      id: '1',
      title: 'Reporte de Ingresos',
      description: 'Análisis detallado de ingresos por período',
      icon: '💰',
      lastGenerated: '2024-03-08',
      period: 'último mes',
    },
    {
      id: '2',
      title: 'Reporte de Vehículos',
      description: 'Estado y utilización de la flota',
      icon: '🚗',
      lastGenerated: '2024-03-07',
      period: 'último mes',
    },
    {
      id: '3',
      title: 'Reporte de Clientes',
      description: 'Análisis de comportamiento de clientes',
      icon: '👥',
      lastGenerated: '2024-03-06',
      period: 'último mes',
    },
    {
      id: '4',
      title: 'Reporte de Contratos',
      description: 'Estadísticas de contratos y alquileres',
      icon: '📄',
      lastGenerated: '2024-03-05',
      period: 'último mes',
    },
  ];

  const handleDownload = (reportId: string) => {
    console.log('Descargar reporte:', reportId);
  };

  const handleGenerate = (reportId: string) => {
    console.log('Generar reporte:', reportId);
  };

  const handleGenerateAll = () => {
    console.log('Generar todos los reportes');
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
