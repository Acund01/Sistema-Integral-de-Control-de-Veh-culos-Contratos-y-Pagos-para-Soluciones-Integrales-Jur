import React, { useMemo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ClientCard from '../components/ClientCard';
import ClientDetailsModal from '../components/ClientDetailsModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import '../styles/ClientManagement.css';
import type { ClienteUnion, ClientStats } from '../types/client';
import { clienteService } from '../services/clienteService';


interface ClientManagementProps {
  onNavigate?: (menuId: string) => void;
  onEditClient?: (id: string, initialData: any) => void;
}

const ClientManagement: React.FC<ClientManagementProps> = ({ onNavigate, onEditClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClienteUnion | null>(null);
  const [clients, setClients] = useState<ClienteUnion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'warning' | 'danger' | 'info' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const location = useLocation();

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClients();
  }, [location.key]);

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
    // Mapear cliente existente a initialData esperado por RegisterClient
    if (onEditClient) {
      if (client.tipoCliente === 'NATURAL') {
        const naturalInitial = {
          nombres: (client as any).nombre,
          apellidos: (client as any).apellido,
          tipoDocumento: ((client as any).tipoDocumento || '').toLowerCase(),
          numeroDocumento: (client as any).numeroDocumento,
          correo: client.correo,
          telefono: client.telefono,
          direccion: client.direccion,
          contactoEmergenciaNombre: (client as any).contactoEmergenciaNombre,
          contactoEmergenciaTelefono: (client as any).contactoEmergenciaTelefono,
          notas: (client as any).notas,
        };
        onEditClient(client.id, naturalInitial);
      } else {
        const empresa = client as any;
        const empresaInitial = {
          razonSocial: empresa.razonSocial,
          ruc: empresa.ruc,
          giroComercial: empresa.giroComercial,
          direccionFiscal: empresa.direccionFiscal,
          correo: empresa.correo,
          telefono: empresa.telefono,
          direccion: empresa.direccion,
          representanteNombres: empresa.representante?.nombre,
          representanteApellidos: empresa.representante?.apellido,
          representanteTipoDocumento: (empresa.representante?.tipoDocumento || '').toLowerCase(),
          representanteNumeroDocumento: empresa.representante?.numeroDocumento,
          representanteCargo: empresa.representante?.cargo,
          representanteCorreo: empresa.representante?.correo,
          representanteTelefono: empresa.representante?.telefono,
          contactoEmergenciaNombre: empresa.contactoEmergenciaNombre,
          contactoEmergenciaTelefono: empresa.contactoEmergenciaTelefono,
          notas: empresa.notas,
        };
        onEditClient(client.id, empresaInitial);
      }
    } else {
      onNavigate?.('register-client');
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar cliente',
      message: '¿Eliminar definitivamente este cliente? Esta acción no se puede deshacer.',
      type: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await clienteService.purge(id);
          setConfirmDialog({
            isOpen: true,
            title: 'Éxito',
            message: 'Cliente eliminado definitivamente',
            type: 'success',
            onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
          });
          await loadClients();
        } catch (err) {
          console.error('Error al eliminar cliente:', err);
          setConfirmDialog({
            isOpen: true,
            title: 'Error',
            message: `Error al eliminar cliente: ${err instanceof Error ? err.message : 'Error desconocido'}`,
            type: 'danger',
            onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
          });
        }
      },
    });
  };

  const handleChangeStatus = async (id: string, activo: boolean) => {
    setConfirmDialog({
      isOpen: true,
      title: `${activo ? 'Activar' : 'Desactivar'} cliente`,
      message: `¿Está seguro de ${activo ? 'activar' : 'desactivar'} este cliente?`,
      type: 'warning',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          await clienteService.setActivo(id, activo);
          setConfirmDialog({
            isOpen: true,
            title: 'Éxito',
            message: `Cliente ${activo ? 'activado' : 'desactivado'} correctamente`,
            type: 'success',
            onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
          });
          await loadClients();
          setSelectedClient(null);
        } catch (err) {
          console.error('Error al cambiar estado:', err);
          setConfirmDialog({
            isOpen: true,
            title: 'Error',
            message: `Error al cambiar estado: ${err instanceof Error ? err.message : 'Error desconocido'}`,
            type: 'danger',
            onConfirm: () => setConfirmDialog(prev => ({ ...prev, isOpen: false })),
          });
        }
      },
    });
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
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default ClientManagement;