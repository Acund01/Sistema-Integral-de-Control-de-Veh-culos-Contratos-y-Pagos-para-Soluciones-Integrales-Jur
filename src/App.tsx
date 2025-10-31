import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ClientManagement from './pages/ClientManagement';
import RegisterClient from './pages/RegisterClient';
import VehicleManagement from './pages/VehicleManagement';
import ContractManagement from './pages/ContractManagement';
import CreateContract from './pages/CreateContract';
import Reports from './pages/Reports';
import Login from './pages/Login';
import type { User } from './types';
import './App.css';

function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);

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
    <Dashboard onNavigate={(menuId: string) => setActiveMenu(menuId)} />
  )}
  {activeMenu === 'clientes' && (
    <ClientManagement onNavigate={(menuId: string) => setActiveMenu(menuId)} />
  )}
  {activeMenu === 'register-client' && (
    <RegisterClient onNavigate={(menuId: string) => setActiveMenu(menuId)} />
  )}
          {activeMenu === 'vehiculos' && (
            <VehicleManagement />
          )}
          {activeMenu === 'agregar-vehiculo' && (
            <VehicleManagement startAdding={true} />
          )}
        {activeMenu === 'contratos' && (
          <ContractManagement onNavigate={(menuId: string) => setActiveMenu(menuId)} />
        )}
        {activeMenu === 'crear-contrato' && (
          <CreateContract onNavigate={(menuId: string) => setActiveMenu(menuId)} />
        )}
        {activeMenu === 'reportes' && <Reports />}
      </main>
    </div>
  );
}

export default App;
