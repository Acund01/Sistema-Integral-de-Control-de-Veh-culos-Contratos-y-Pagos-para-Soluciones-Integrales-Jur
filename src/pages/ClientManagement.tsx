import React, { useMemo, useState, useEffect } from 'react';
import ClientCard from '../components/ClientCard';
import ClientDetailsModal from '../components/ClientDetailsModal';
import '../styles/ClientManagement.css';
import type { ClienteUnion, ClientStats } from '../types/client';
import { clienteService } from '../services/clienteService';


interface ClientManagementProps {
  onNavigate?: (menuId: string) => void;
}

const ClientManagement: React.FC<ClientManagementProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClienteUnion | null>(null);
  const [clients, setClients] = useState<ClienteUnion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const clientesData = await clienteService.findAll();
      setClients(clientesData);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  // Helper para obtener el nombre completo del cliente
  const getClientFullName = (client: ClienteUnion): string => {
    if (client.tipoCliente === 'NATURAL') {
      return `${client.nombre} ${client.apellido}`;
    } else {
      return client.razonSocial;
    }
  };

  const stats: ClientStats = useMemo(() => {
    const total = clients.length;
    const active = clients.filter(c => c.activo).length;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const newThisMonth = clients.filter(c => {
      const created = new Date(c.creadoEn);
      if (isNaN(created.getTime())) return false;
      return created.getFullYear() === year && created.getMonth() === month;
    }).length;
    return { total, active, newThisMonth };
  }, [clients]);

  const filteredClients = clients.filter(client => {
    const fullName = getClientFullName(client).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      client.correo.toLowerCase().includes(searchLower) ||
      (client.direccion && client.direccion.toLowerCase().includes(searchLower))
    );
  });

  const handleNewClient = () => {
    onNavigate?.('register-client');
  };

  const handleViewDetails = (client: ClienteUnion) => {
    setSelectedClient(client);
  };

  const handleEdit = (client: ClienteUnion) => {
    // TODO: Implementar edición con navegación a RegisterClient pasando el cliente
    console.log('Editar cliente:', client);
    onNavigate?.('register-client');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      return;
    }
    
    try {
      await clienteService.delete(id);
      alert('Cliente eliminado exitosamente');
      // Recargar la lista
      await loadClients();
    } catch (err) {
      console.error('Error al eliminar cliente:', err);
      alert(`Error al eliminar cliente: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const handleChangeStatus = async (id: string, activo: boolean) => {
    try {
      // El backend hace soft delete, así que para cambiar el estado
      // necesitamos implementar un endpoint específico o usar delete para desactivar
      if (!activo) {
        await clienteService.delete(id);
      }
      // Recargar la lista
      await loadClients();
      setSelectedClient(null);
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      alert(`Error al cambiar estado: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
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

      {/* Loading y Error States */}
      {loading && (
        <div className="loading-message" style={{ padding: '20px', textAlign: 'center' }}>
          Cargando clientes...
        </div>
      )}
      
      {error && (
        <div className="error-message" style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
          Error: {error}
        </div>
      )}

      {/* Stats Cards */}
      {!loading && !error && (
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
                handleEdit(client);
                setSelectedClient(null);
              }}
              onDelete={(id) => {
                handleDelete(id);
              }}
              onChangeStatus={(id, activo) => {
                handleChangeStatus(id, activo);
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
      )}

      {/* Client List */}
      {!loading && !error && (
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
      )}
    </div>
  );
};

export default ClientManagement;
