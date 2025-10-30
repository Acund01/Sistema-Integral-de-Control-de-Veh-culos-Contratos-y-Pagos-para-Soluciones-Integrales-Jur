import React, { useMemo, useState } from 'react';
import ClientCard from '../components/ClientCard';
import ClientDetailsModal from '../components/ClientDetailsModal';
import '../styles/ClientManagement.css';
import type { Client, ClientStats } from '../types/client';


interface ClientManagementProps {
  clients?: Client[];
  onNavigate?: (menuId: string) => void;
  onDeleteClient?: (id: string) => void;
  onEditClient?: (client: Client) => void;
  onChangeClientStatus?: (id: string, status: Client['status']) => void;
}

const ClientManagement: React.FC<ClientManagementProps> = ({ clients = [], onNavigate, onDeleteClient, onEditClient, onChangeClientStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const stats: ClientStats = useMemo(() => {
    const total = clients.length;
    const active = clients.filter(c => c.status === 'Activo').length;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const newThisMonth = clients.filter(c => {
      // Preferir createdAt; fallback a timestamp numérico en id si aplica
      let created: Date | null = null;
      if (c.createdAt) {
        const d = new Date(c.createdAt);
        if (!isNaN(d.getTime())) created = d;
      } else if (/^\d{10,}$/.test(c.id)) {
        const d = new Date(Number(c.id));
        if (!isNaN(d.getTime())) created = d;
      }
      if (!created) return false;
      return created.getFullYear() === year && created.getMonth() === month;
    }).length;
    return { total, active, newThisMonth };
  }, [clients]);

  // `clients` prop is the source of truth; if empty, you may show a placeholder list or none.

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewClient = () => {
    onNavigate?.('register-client');
  };

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
  };

  const handleEdit = (client: Client) => {
    // Por ahora navegamos al registro para editar/crear
    onEditClient?.(client);
    onNavigate?.('register-client');
  };

  const handleDelete = (id: string) => {
    onDeleteClient?.(id);
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
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-users" width="38" height="38" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"></path>
                <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                <path d="M21 21v-2a4 4 0 0 0 -3 -3.85"></path>
          </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Clientes</div>
          </div>
        </div>

          {selectedClient && (
            <ClientDetailsModal
              client={selectedClient}
              onClose={() => setSelectedClient(null)}
              onEdit={(client) => {
                onEditClient?.(client);
                setSelectedClient(null);
                onNavigate?.('register-client');
              }}
              onDelete={(id) => {
                onDeleteClient?.(id);
                setSelectedClient(null);
              }}
              onChangeStatus={(id, status) => {
                onChangeClientStatus?.(id, status);
                setSelectedClient(prev => (prev && prev.id === id ? { ...prev, status } : prev));
              }}
            />
          )}

        <div className="stat-card-simple">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-user-check" width="38" height="38" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"></path>
                <path d="M6 21v-2a4 4 0 0 1 4 -4h4"></path>
                <path d="M15 19l2 2l4 -4"></path>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Clientes Activos</div>
          </div>
        </div>

        <div className="stat-card-simple">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-plus" width="38" height="38" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M12 5l0 14"></path>
                <path d="M5 12l14 0"></path>
            </svg>
          </div>
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
              onViewDetails={handleViewDetails}
              onEditClient={handleEdit}
              onDeleteClient={handleDelete}
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
