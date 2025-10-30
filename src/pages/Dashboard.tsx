import React, { useMemo } from 'react';
import StatCard from '../components/StatCard';
import QuickActionCard from '../components/QuickActionCard';
import ActivityList from '../components/ActivityList';
import AlertCard from '../components/AlertCard';
import clienteGif from '../assets/cliente.gif';
import vehiculoGif from '../assets/carro.gif';
import documentosGif from '../assets/documentos.gif';
import dineroGif from '../assets/dinero.gif';
import '../styles/Dashboard.css';
import type { StatCard as StatCardType, QuickAction, Activity, Alert } from '../types';
import type { Client } from '../types/client';
import type { Vehicle } from '../types/vehicle';
import type { Contract } from '../types/contract';

interface DashboardProps {
  onNavigate?: (menuId: string) => void;
  clients?: Client[];
  vehicles?: Vehicle[];
  contracts?: Contract[];
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, clients = [], vehicles = [], contracts = [] }) => {
  // Cálculo de estadísticas en base a datos reales
  const computedStats = useMemo(() => {
    const today = new Date();
    const clamp = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const activeClients = clients.filter(c => c.status === 'Activo').length;
    const availableVehicles = vehicles.filter(v => v.status === 'Disponible').length;
    const activeContracts = contracts.filter(c => c.status === 'Activo' && clamp(new Date(c.endDate)) >= clamp(today)).length;

    // Ingresos del mes (prorrateado por días dentro del mes)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const clampDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const daysBetweenInclusive = (a: Date, b: Date) => Math.max(0, Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const monthlyIncome = contracts.reduce((acc, c) => {
      const start = clampDate(new Date(c.startDate));
      const end = clampDate(new Date(c.endDate));
      const startOverlap = start < monthStart ? monthStart : start;
      const endOverlap = end > monthEnd ? monthEnd : end;
      if (endOverlap < monthStart || startOverlap > monthEnd) return acc;
      const days = daysBetweenInclusive(startOverlap, endOverlap);
      return acc + days * (c.dailyRate || 0);
    }, 0);

    return { activeClients, availableVehicles, activeContracts, monthlyIncome };
  }, [clients, vehicles, contracts]);

  const stats: StatCardType[] = [
    {
      title: 'Clientes Activos',
      value: computedStats.activeClients,
      change: '—',
      changeType: 'neutral',
      icon: <img src={clienteGif} alt="Clientes" style={{ width: 70, height: 70 }} /> ,
    },
    {
      title: 'Vehículos Disponibles',
      value: computedStats.availableVehicles,
      change: '—',
      changeType: 'neutral',
      icon:<img src={vehiculoGif} alt="Vehículos" style={{ width: 70, height: 70 }} /> ,
    },
    {
      title: 'Contratos Activos',
      value: computedStats.activeContracts,
      change: '—',
      changeType: 'neutral',
      icon: <img src={documentosGif} alt="Documentos" style={{ width: 70, height: 70 }} /> ,
    },
    {
      title: 'Ingresos del Mes',
      value: `S/. ${computedStats.monthlyIncome.toLocaleString()}`,
      change: '—',
      changeType: 'neutral',
      icon: <img src={dineroGif} alt="Dinero" style={{ width: 70, height: 70 }} /> ,
    },
  ];

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Nuevo Cliente',
      description: 'Registrar un cliente nuevo',
      icon: '👤',
    },
    {
      id: '2',
      title: 'Agregar Vehículo',
      description: 'Añadir vehículo al inventario',
      icon: '🚗',
    },
    {
      id: '3',
      title: 'Nuevo Contrato',
      description: 'Crear contrato de alquiler',
      icon: '📝',
    },
    {
      id: '4',
      title: 'Ver Reportes',
      description: 'Generar reportes y análisis',
      icon: '📊',
    },
  ];

  const activities: Activity[] = [
    {
      id: '1',
      description: 'Nuevo contrato creado para Juan Pérez',
      time: 'hace 2 horas',
    },
    {
      id: '2',
      description: 'Vehículo Toyota Corolla agregado',
      time: 'hace 4 horas',
    },
    {
      id: '3',
      description: 'Cliente María González registrada',
      time: 'hace 6 horas',
    },
    {
      id: '4',
      description: 'Contrato finalizado - Luis Rodríguez',
      time: 'hace 1 día',
    },
  ];

  const alerts: Alert[] = [
    {
      id: '1',
      type: 'warning',
      title: '3 contratos vencen esta semana',
      description: 'Revisa los contratos próximos a vencer',
    },
    {
      id: '2',
      type: 'info',
      title: '2 vehículos requieren mantenimiento',
      description: 'Programa el mantenimiento preventivo',
    },
  ];

  const handleQuickAction = (actionId: string) => {
    console.log(`Acción rápida seleccionada: ${actionId}`);
    // Si se selecciona 'Nuevo Cliente' (id '1'), navegar a la gestión de clientes
    if (actionId === '1') {
      onNavigate?.('register-client');
      return;
    }

    // Si se selecciona 'Agregar Vehículo' (id '2'), navegar directamente al formulario de agregar vehículo
    if (actionId === '2') {
      onNavigate?.('agregar-vehiculo');
      return;
    }

    // Si se selecciona 'Nuevo Contrato' (id '3')
    if (actionId === '3') {
      onNavigate?.('crear-contrato');
      return;
    }

    // Si se selecciona 'Ver Reportes' (id '4')
    if (actionId === '4') {
      onNavigate?.('reportes');
      return;
    }

    // Lógica por defecto para otras acciones
    // (por ejemplo, abrir modales o navegar a otras secciones)
  };

  const handleAlertView = (alertId: string) => {
    console.log(`Ver alerta: ${alertId}`);
    // Aquí puedes agregar la lógica para ver detalles de la alerta
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard Principal</h1>
        <p className="dashboard-subtitle">Resumen general del sistema de gestión de alquileres</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Contenido principal */}
      <div className="dashboard-content">
        {/* Acciones Rápidas */}
        <div className="quick-actions-section">
          <h2 className="section-title">Acciones Rápidas</h2>
          <div className="quick-actions-grid">
            {quickActions.map((action) => (
              <QuickActionCard
                key={String(action.id)}
                {...action}
                onClick={() => handleQuickAction(String(action.id))}
              />
            ))}
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="activity-section">
          <ActivityList activities={activities} />
        </div>
      </div>

      {/* Alertas y Recordatorios */}
      <div className="alerts-section">
        <h2 className="section-title">
          <span className="alert-icon-title">⚠️</span>
          Alertas y Recordatorios
        </h2>
        <div className="alerts-grid">
          {alerts.map((alert) => (
            <AlertCard
              key={String(alert.id)}
              {...alert}
              onView={() => handleAlertView(String(alert.id))}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


