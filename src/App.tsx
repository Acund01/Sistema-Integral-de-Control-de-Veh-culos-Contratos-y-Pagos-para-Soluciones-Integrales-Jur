import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ClientManagement from './pages/ClientManagement';
import RegisterClient from './pages/RegisterClient';
import VehicleManagement from './pages/VehicleManagement';
import ContractManagement from './pages/ContractManagement';
import CreateContract from './pages/CreateContract';
import Reports from './pages/Reports';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Layout para las rutas protegidas que incluye el Sidebar
const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ name: 'Usuario', username: '' });

  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if (storedUser) {
      setUser({ name: storedUser, username: storedUser });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
    navigate('/login');
  };

  const handleMenuClick = (menuId: string) => {
    navigate(`/${menuId}`);
  };

  // Determinar el menú activo basado en la ruta actual
  const activeMenu = location.pathname.substring(1) || 'dashboard';

  return (
    <div className="app-container">
      <Sidebar
        activeMenu={activeMenu}
        onMenuClick={handleMenuClick}
        onLogout={handleLogout}
        user={user}
      />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  const navigate = useNavigate();
  const [editingContract, setEditingContract] = useState<any>(null);
  const [editingClient, setEditingClient] = useState<{id: string, data: any} | null>(null);

  const handleNavigate = (menuId: string) => {
    // Limpiar estados de edición al navegar a formularios de creación
    if (menuId === 'register-client') {
      setEditingClient(null);
    }
    if (menuId === 'crear-contrato') {
      setEditingContract(null);
    }
    navigate(`/${menuId}`);
  };

  const handleStartEditContract = (contract: any) => {
    setEditingContract(contract);
    navigate('/crear-contrato');
  };

  const handleStartEditClient = (id: string, data: any) => {
    setEditingClient({ id, data });
    navigate('/register-client');
  };

  return (
    <Routes>
      {/* Ruta pública de Login */}
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard onNavigate={handleNavigate} />} />
          
          {/* Página de gestión de vehículos real */}
          <Route path="/vehiculos" element={<VehicleManagement />} />
          <Route path="/agregar-vehiculo" element={<VehicleManagement startAdding={true} />} />

          {/* Otras rutas existentes mapeadas */}
          <Route path="/clientes" element={
            <ClientManagement 
              onNavigate={handleNavigate} 
              onEditClient={handleStartEditClient} 
            />
          } />
          <Route path="/contratos" element={
            <ContractManagement 
              onNavigate={handleNavigate} 
              onStartEditContract={handleStartEditContract} 
            />
          } />
          <Route path="/reportes" element={<Reports />} />
          
          {/* Rutas adicionales para mantener compatibilidad básica */}
          <Route path="/register-client" element={
            <RegisterClient 
              onNavigate={handleNavigate} 
              clientId={editingClient?.id}
              initialData={editingClient?.data}
            />
          } />
          <Route path="/crear-contrato" element={
            <CreateContract 
              onNavigate={handleNavigate} 
              contractToEdit={editingContract}
            />
          } />
        </Route>
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
