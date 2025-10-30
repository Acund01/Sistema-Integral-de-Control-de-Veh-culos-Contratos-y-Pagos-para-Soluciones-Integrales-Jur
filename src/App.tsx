import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ClientManagement from './pages/ClientManagement';
import RegisterClient from './pages/RegisterClient';
import type { Client } from './types/client';
import VehicleManagement from './pages/VehicleManagement';
import ContractManagement from './pages/ContractManagement';
import CreateContract from './pages/CreateContract';
import Reports from './pages/Reports';
import Login from './pages/Login';
import type { User } from './types';
import type { Contract } from './types/contract';
import type { Vehicle } from './types/vehicle';
import './App.css';

function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [editingInitialData, setEditingInitialData] = useState<{
    nombres?: string;
    apellidos?: string;
    correo?: string;
    telefono?: string;
    ciudad?: string;
  } | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const handleMenuClick = (menuId: string) => {
    setActiveMenu(menuId);
  };

  const handleLogin = (username: string, password: string) => {
    // Credenciales de prueba
    if (username === 'admin' && password === 'admin123') {
      setUser({
        username: username,
        name: 'Administrador'
      });
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveMenu('dashboard');
  };

  const handleCreateContract = (contract: Contract) => {
    setContracts(prev => [contract, ...prev]);
    setActiveMenu('contratos');
  };

  const handleUpdateContract = (updated: Contract) => {
    setContracts(prev => prev.map(c => c.id === updated.id ? updated : c));
    setEditingContract(null);
    setActiveMenu('contratos');
  };

  const handleDeleteContract = (id: string) => {
    setContracts(prev => prev.filter(c => c.id !== id));
  };

  const handleStartEditContract = (contract: Contract) => {
    setEditingContract(contract);
    setActiveMenu('crear-contrato');
  };

  // Vehículos
  const handleAddVehicle = (vehicle: Vehicle) => {
    setVehicles(prev => [vehicle, ...prev]);
    setActiveMenu('vehiculos');
  };

  const handleUpdateVehicle = (id: string, patch: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...patch } : v));
    setActiveMenu('vehiculos');
  };

  const handleDeleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  const handleAddClient = (client: Partial<Client> & { nombres?: string; apellidos?: string; correo?: string; telefono?: string; ciudad?: string; }) => {
    // asignar id simple y mapear campos del formulario
    const newClient: Client = {
      id: Date.now().toString(),
      name: `${client.nombres || ''} ${client.apellidos || ''}`.trim() || (client.name || 'Sin Nombre'),
      email: client.correo || client.email || '',
      phone: client.telefono || client.phone || '',
      location: client.ciudad || client.location || '',
      contracts: 0,
      status: 'Activo',
      createdAt: new Date().toISOString(),
    };
    setClients((prev) => [newClient, ...prev]);
    setActiveMenu('clientes');
    // limpiar posible estado de edición
    setEditingClientId(null);
    setEditingInitialData(null);
  };

  const handleUpdateClient = (id: string, patch: Partial<Client> & { nombres?: string; apellidos?: string; correo?: string; telefono?: string; ciudad?: string; }) => {
    setClients((prev) => prev.map(c => {
      if (c.id !== id) return c;
      const name = `${patch.nombres || ''} ${patch.apellidos || ''}`.trim() || c.name;
      return {
        ...c,
        name,
        email: patch.correo ?? c.email,
        phone: patch.telefono ?? c.phone,
        location: patch.ciudad ?? c.location,
        status: patch.status ?? c.status,
      };
    }));
    setActiveMenu('clientes');
    setEditingClientId(null);
    setEditingInitialData(null);
  };

  const handleChangeClientStatus = (id: string, status: Client['status']) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const handleStartEditClient = (client: Client) => {
    // dividir nombre simple en nombres/apellidos (heurística básica)
    const parts = (client.name || '').trim().split(/\s+/);
    const nombres = parts.slice(0, Math.max(1, parts.length - 1)).join(' ');
    const apellidos = parts.length > 1 ? parts.slice(-1).join(' ') : '';
    setEditingClientId(client.id);
    setEditingInitialData({
      nombres,
      apellidos,
      correo: client.email,
      telefono: client.phone,
      ciudad: client.location,
    });
    setActiveMenu('register-client');
  };

  const handleDeleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // Si no hay usuario autenticado, mostrar Login
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Si hay usuario autenticado, mostrar la aplicación
  return (
    <div className="app-container">
      <Sidebar 
        activeMenu={activeMenu} 
        onMenuClick={handleMenuClick}
        onLogout={handleLogout}
        user={user}
      />
      <main className="main-content">
  {activeMenu === 'dashboard' && (
    <Dashboard
      onNavigate={(menuId: string) => setActiveMenu(menuId)}
      clients={clients}
      vehicles={vehicles}
      contracts={contracts}
    />
  )}
  {activeMenu === 'clientes' && (
    <ClientManagement
      clients={clients}
      onNavigate={(menuId: string) => setActiveMenu(menuId)}
      onDeleteClient={handleDeleteClient}
      onEditClient={handleStartEditClient}
      onChangeClientStatus={handleChangeClientStatus}
    />
  )}
  {activeMenu === 'register-client' && (
    <RegisterClient
      onNavigate={(menuId: string) => setActiveMenu(menuId)}
      onAddClient={handleAddClient}
      clientId={editingClientId ?? undefined}
      initialData={editingInitialData ?? undefined}
      onUpdateClient={handleUpdateClient}
    />
  )}
          {activeMenu === 'vehiculos' && (
            <VehicleManagement
              vehicles={vehicles}
              onAddVehicle={handleAddVehicle}
              onUpdateVehicle={handleUpdateVehicle}
              onDeleteVehicle={handleDeleteVehicle}
            />
          )}
          {activeMenu === 'agregar-vehiculo' && (
            <VehicleManagement
              startAdding={true}
              vehicles={vehicles}
              onAddVehicle={handleAddVehicle}
              onUpdateVehicle={handleUpdateVehicle}
              onDeleteVehicle={handleDeleteVehicle}
            />
          )}
        {activeMenu === 'contratos' && (
          <ContractManagement
            contracts={contracts}
            onNavigate={(menuId: string) => setActiveMenu(menuId)}
            onDeleteContract={handleDeleteContract}
            onStartEditContract={handleStartEditContract}
          />
        )}
        {activeMenu === 'crear-contrato' && (
          <CreateContract
            onNavigate={(menuId: string) => setActiveMenu(menuId)}
            onCreate={handleCreateContract}
            contractToEdit={editingContract ?? undefined}
            onUpdate={handleUpdateContract}
            clients={clients}
            vehicles={vehicles}
          />
        )}
        {activeMenu === 'reportes' && <Reports />}
      </main>
    </div>
  );
}

export default App;
