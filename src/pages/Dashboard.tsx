import React from 'react';
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

interface DashboardProps {
  onNavigate?: (menuId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const stats: StatCardType[] = [
    {
      title: 'Clientes Activos',
      value: '127',
      change: '+12% vs mes anterior',
      changeType: 'positive',
      icon: <img src={clienteGif} alt="Clientes" style={{ width: 70, height: 70 }} /> ,
    },
    {
      title: 'Vehículos Disponibles',
      value: '34',
      change: '+2 nuevos este mes',
      changeType: 'positive',
      icon:<img src={vehiculoGif} alt="Vehículos" style={{ width: 70, height: 70 }} /> ,
    },
    {
      title: 'Contratos Activos',
      value: '89',
      change: '+8% vs mes anterior',
      changeType: 'positive',
      icon: <img src={documentosGif} alt="Documentos" style={{ width: 70, height: 70 }} /> ,
    },
    {
      title: 'Ingresos del Mes',
      value: 'S/. 45,230',
      change: '+15% vs mes anterior',
      changeType: 'positive',
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
                key={action.id}
                {...action}
                onClick={() => handleQuickAction(action.id)}
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
              key={alert.id}
              {...alert}
              onView={() => handleAlertView(alert.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


