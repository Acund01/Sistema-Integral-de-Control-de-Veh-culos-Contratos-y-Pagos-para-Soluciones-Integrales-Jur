import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  // Si no hay token, redirigir al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, renderizar el contenido de la ruta (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;