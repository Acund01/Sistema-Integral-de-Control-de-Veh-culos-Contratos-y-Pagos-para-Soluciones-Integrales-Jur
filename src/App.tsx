import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ClientManagement from './pages/ClientManagement';
import RegisterClient from './pages/RegisterClient';
import type { Client } from './types/client';
import VehicleManagement from './pages/VehicleManagement';
import ContractManagement from './pages/ContractManagement';
import Reports from './pages/Reports';
import Login from './pages/Login';
import type { User } from './types';
import './App.css';

function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  const handleMenuClick = (menuId: string) => {
    setActiveMenu(menuId);
  };

  const handleLogin = (username: string, password: string) => {
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

  const handleAddClient = (client: Partial<Client> & { nombres?: string; apellidos?: string; correo?: string; telefono?: string; ciudad?: string; }) => {
    const newClient: Client = {
      id: Date.now().toString(),
      name: `${client.nombres || ''} ${client.apellidos || ''}`.trim() || (client.name || 'Sin Nombre'),
      email: client.correo || client.email || '',
      phone: client.telefono || client.phone || '',
      location: client.ciudad || client.location || '',
      contracts: 0,
      status: 'Activo',
    };
    setClients((prev) => [newClient, ...prev]);
    setActiveMenu('clientes');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Sidebar 
        activeMenu={activeMenu} 
        onMenuClick={handleMenuClick}
        onLogout={handleLogout}
        user={user}
      />
      <main className="main-content">
        {activeMenu === 'dashboard' && <Dashboard onNavigate={handleMenuClick} />}
        {activeMenu === 'clientes' && <ClientManagement clients={clients} onNavigate={handleMenuClick} />}
        {activeMenu === 'register-client' && <RegisterClient onNavigate={handleMenuClick} onAddClient={handleAddClient} />}
        {activeMenu === 'vehiculos' && <VehicleManagement />}
        {activeMenu === 'agregar-vehiculo' && <VehicleManagement startAdding={true} />}
        {activeMenu === 'contratos' && <ContractManagement />}
        {activeMenu === 'reportes' && <Reports />}
      </main>
    </div>
  );
}

export default App;
