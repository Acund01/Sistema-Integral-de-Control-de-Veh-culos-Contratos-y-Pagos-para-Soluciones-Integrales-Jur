import React from 'react';
import '../styles/Sidebar.css';
import type { MenuItem, User } from '../types';
import companyGif from '../assets/login.gif';
import exit from '../assets/Close.gif';
import personalGif from '../assets/personas.gif';
import CarGif from '../assets/Car.gif';
import FileGif from '../assets/file.gif';
import AnalyticsGif from '../assets/analytics.gif';
import ReportGif from '../assets/reports.gif';


interface SidebarProps {
  activeMenu: string;
  onMenuClick: (menuId: string) => void;
  onLogout: () => void;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ activeMenu, onMenuClick, onLogout, user }) => {
  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard Principal', icon:<img src={AnalyticsGif} alt="Persona" style={{ width: '30px', height: '30px', objectFit: 'contain' }} /> , path: '/dashboard' },
    { id: 'clientes', label: 'Gestión de Clientes', icon: <img src={personalGif} alt="Persona" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />, path: '/clientes' },
    { id: 'vehiculos', label: 'Gestión de Vehículos', icon: <img src={CarGif} alt="Persona" style={{ width: '30px', height: '30px', objectFit: 'contain' }} /> , path: '/vehiculos' },
    { id: 'contratos', label: 'Contratos de Alquiler', icon: <img src={FileGif} alt="Persona" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />, path: '/contratos' },
    { id: 'reportes', label: 'Reportes', icon: <img src={ReportGif} alt="Persona" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />, path: '/reportes' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">
            <img src={companyGif} alt="Empresa" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
          </span>
        </div>
        <div className="company-info">
          <h2 className="company-name">Soluciones Integrales</h2>
          <p className="company-subtitle">Juri</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => onMenuClick(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <span className="user-name">{user.name}</span>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          <span className="nav-icon">
            <img src={exit} alt="Salir" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
          </span>
          <span className="nav-label">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
