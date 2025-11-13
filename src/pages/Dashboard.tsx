import React, { useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import QuickActionCard from '../components/QuickActionCard';
import ActivityList from '../components/ActivityList';
import { activityService } from '../services/activityService';
import AlertCard from '../components/AlertCard';
import clienteGif from '../assets/cliente.gif';
import vehiculoGif from '../assets/carro.gif';
import documentosGif from '../assets/documentos.gif';
import dineroGif from '../assets/dinero.gif';
import '../styles/Dashboard.css';
import type { StatCard as StatCardType, QuickAction, Activity, Alert } from '../types';
import type { ClienteUnion } from '../types/client';
import type { Vehiculo } from '../types/vehicle';
import type { ContratoResponseDto } from '../types/contract';
import { clienteService } from '../services/clienteService';
import { vehiculoService } from '../services/vehiculoService';
import { contratoService } from '../services/contratoService';

interface DashboardProps {
  onNavigate?: (menuId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  // Estados locales con datos del backend
  const [clients, setClients] = useState<ClienteUnion[]>([]);
  const [vehicles, setVehicles] = useState<Vehiculo[]>([]);
  const [contracts, setContracts] = useState<ContratoResponseDto[]>([]);

  // Cargar datos mínimos para stats del dashboard
  useEffect(() => {
    // Cargar en paralelo; si falla algo, dejamos valores por defecto
    Promise.allSettled([
      clienteService.findAll().then(setClients),
      vehiculoService.findAll().then(setVehicles),
      contratoService.findAll().then(setContracts),
    ]).then(() => void 0);
  }, []);

  // Cálculo de estadísticas en base a datos reales del backend
  const computedStats = useMemo(() => {
    const today = new Date();
    const clamp = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const activeClients = clients.filter(c => !!c.activo).length;
    const availableVehicles = vehicles.filter(v => v.estado === 'DISPONIBLE').length;
    const activeContracts = contracts.filter(c => (c.estado?.toUpperCase?.() !== 'FINALIZADO' && c.estado?.toUpperCase?.() !== 'CANCELADO') && clamp(new Date(c.fechaFin)) >= clamp(today)).length;

    // Ingresos del mes (prorrateado por días dentro del mes)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const clampDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const daysBetweenInclusive = (a: Date, b: Date) => Math.max(0, Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const monthlyIncome = contracts.reduce((acc, c) => {
      const start = clampDate(new Date(c.fechaInicio));
      const end = clampDate(new Date(c.fechaFin));
      const startOverlap = start < monthStart ? monthStart : start;
      const endOverlap = end > monthEnd ? monthEnd : end;
      if (endOverlap < monthStart || startOverlap > monthEnd) return acc;
      const days = daysBetweenInclusive(startOverlap, endOverlap);
      const precioDiario = c.detalles?.[0]?.precioDiario || 0;
      return acc + days * precioDiario;
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

  const [activities, setActivities] = useState<Activity[]>([]);

  // Actividad reciente en tiempo real (localStorage + suscripción)
  useEffect(() => {
    const update = () => setActivities(activityService.getRecent());
    update();
    const unsub = activityService.subscribe(update);
    const t = setInterval(update, 60_000); // refrescar textos relativos
    return () => { unsub(); clearInterval(t); };
  }, []);

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
      activityService.log('Navegaste a Reportes');
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


