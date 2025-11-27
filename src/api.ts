import axios from 'axios';

// Crear instancia de Axios con la URL base del API Gateway
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor para añadir el token a cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación (401/403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Si el token es inválido o expiró, limpiar y redirigir al login
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('roles');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
