import React, { useState, useEffect } from 'react';
import authService from './services/authService';
import ProjectsPage from './pages/ProjectsPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'miembro'
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      let result;
      if (isLogin) {
        result = await authService.login({ email: formData.email, password: formData.password });
      } else {
        result = await authService.register(formData);
      }
      setUser(result.user);
      setMessage(`✅ Bienvenido ${result.user.nombre}`);
      setFormData({ nombre: '', email: '', password: '', rol: 'miembro' });
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.error || 'Error en la operación'}`);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentPage('dashboard');
    setMessage('✅ Sesión cerrada');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  if (user) {
    if (currentPage === 'dashboard') {
      return <DashboardPage user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
    }
    return <ProjectsPage user={user} onNavigate={handleNavigate} onLogout={handleLogout} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>📊 Sistema de Gestión de Proyectos</h1>
        <h2>{isLogin ? '🔐 Iniciar Sesión' : '📝 Registrarse'}</h2>
        {message && <p className="message">{message}</p>}
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <input
              type="text"
              name="nombre"
              placeholder="Nombre completo"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {!isLogin && (
            <select name="rol" value={formData.rol} onChange={handleChange}>
              <option value="miembro">👤 Miembro</option>
              <option value="manager">📋 Manager</option>
              <option value="admin">👑 Administrador</option>
            </select>
          )}
          <button type="submit">{isLogin ? 'Ingresar' : 'Registrarse'}</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="switch-btn">
          {isLogin ? '✨ Crear una cuenta' : '🔙 Ya tengo una cuenta'}
        </button>
      </header>
    </div>
  );
}

export default App;