import React, { useState } from 'react';
import ClientCard from '../components/ClientCard';
import '../styles/ClientManagement.css';
import type { Client, ClientStats } from '../types/client';

const ClientManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const stats: ClientStats = {
    total: 127,
    active: 95,
    newThisMonth: 12,
  };

  const clients: Client[] = [
    {
      id: '1',
      name: 'Juan Pérez García',
      email: 'juan.perez@email.com',
      phone: '+51 1 234-5678',
      location: 'Lima',
      contracts: 2,
      status: 'Activo',
    },
    {
      id: '2',
      name: 'María González López',
      email: 'maria.gonzalez@email.com',
      phone: '+51 1 876-5432',
      location: 'Arequipa',
      contracts: 1,
      status: 'Activo',
    },
    {
      id: '3',
      name: 'Carlos Rodríguez Sánchez',
      email: 'carlos.rodriguez@email.com',
      phone: '+51 44 555-123',
      location: 'Trujillo',
      contracts: 0,
      status: 'Inactivo',
    },
    {
      id: '4',
      name: 'Ana Martínez Flores',
      email: 'ana.martinez@email.com',
      phone: '+51 84 987-654',
      location: 'Cusco',
      contracts: 3,
      status: 'Activo',
    },
  ];

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
