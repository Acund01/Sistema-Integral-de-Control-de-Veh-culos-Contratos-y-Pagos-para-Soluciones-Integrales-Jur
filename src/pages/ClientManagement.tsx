import React, { useState } from 'react';
import ClientCard from '../components/ClientCard';
import '../styles/ClientManagement.css';
import type { Client, ClientStats } from '../types/client';

interface ClientManagementProps {
  clients?: Client[];
}

const ClientManagement: React.FC<ClientManagementProps> = ({ clients = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const stats: ClientStats = {
    total: 127,
    active: 95,
    newThisMonth: 12,
  };

  // `clients` prop is the source of truth; if empty, you may show a placeholder list or none.

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewClient = () => {
    console.log('Crear nuevo cliente');
  };

  const handleClientMenu = (clientId: string) => {
    console.log('Menú del cliente:', clientId);
  };

  const handleFilters = () => {
    console.log('Abrir filtros');
  };

  return (
    <div className="client-management">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Gestión de Clientes</h1>
          <p className="page-subtitle">Administra la información de tus clientes</p>
        </div>
        
        <button className="btn-primary" onClick={handleNewClient}>
          <span className="btn-icon">+</span>
          Nuevo Cliente
        </button>
      </div>

      {/* Stats Cards */}
      <div className="client-stats">
        <div className="stat-card-simple">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Clientes</div>
          </div>
        </div>

        <div className="stat-card-simple">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Clientes Activos</div>
          </div>
        </div>

        <div className="stat-card-simple">
          <div className="stat-icon">➕</div>
          <div className="stat-content">
            <div className="stat-value">{stats.newThisMonth}</div>
            <div className="stat-label">Nuevos este Mes</div>
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="client-list-section">
        <h2 className="section-title">Lista de Clientes</h2>
        
        <div className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-filters" onClick={handleFilters}>
            Filtros
          </button>
        </div>

        <div className="clients-list">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onMenuClick={() => handleClientMenu(client.id)}
            />
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="no-results">
            <p>No se encontraron clientes que coincidan con la búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientManagement;
