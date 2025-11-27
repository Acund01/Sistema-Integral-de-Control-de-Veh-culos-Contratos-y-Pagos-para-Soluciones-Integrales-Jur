import { useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import companyGif from '../assets/login.gif';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    try {
      // Hacemos POST directo a la URL de autenticación
      const response = await axios.post(import.meta.env.VITE_AUTH_URL, {
        username,
        password,
      });

      const { token, username: user, roles } = response.data;

      // Guardar datos en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('username', user);
      localStorage.setItem('roles', JSON.stringify(roles));

      // Redirigir al dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo">
            <span className="logo-icon" >
              <img src={companyGif} alt="Empresa" style={{ width: '220px', height: '220px', objectFit: 'contain', marginBottom: '1rem' }} />
            </span>
          </div>
          <h1 className="login-company-name">Soluciones Integrales Juri</h1>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2 className="login-title">Iniciar Sesión</h2>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">Usuario</label>
              <input
                type="text"
                id="username"
                className="form-input"
                placeholder="Valor"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="Valor"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-button">
              Iniciar Sesión
            </button>

            <a href="#" className="forgot-password">¿Olvidaste la contraseña?</a>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
