import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import statsService from '../services/statsService';

function DashboardPage({ user, onNavigate, onLogout }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await statsService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Cargando estadísticas...</div>
      </div>
    );
  }

  const projectData = [
    { name: 'Pendientes', value: stats.projects.pendientes, color: '#ffc107' },
    { name: 'En Progreso', value: stats.projects.enProgreso, color: '#17a2b8' },
    { name: 'Completados', value: stats.projects.completados, color: '#28a745' }
  ];

  const taskStatusData = [
    { name: 'Pendientes', value: stats.tasks.pendientes, color: '#ffc107' },
    { name: 'En Progreso', value: stats.tasks.enProgreso, color: '#17a2b8' },
    { name: 'Revisión', value: stats.tasks.revision, color: '#fd7e14' },
    { name: 'Completadas', value: stats.tasks.completadas, color: '#28a745' }
  ];

  const priorityData = [
    { prioridad: 'Baja', cantidad: stats.tasks.porPrioridad.baja, color: '#28a745' },
    { prioridad: 'Media', cantidad: stats.tasks.porPrioridad.media, color: '#ffc107' },
    { prioridad: 'Alta', cantidad: stats.tasks.porPrioridad.alta, color: '#dc3545' }
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>📊 Dashboard de Gestión de Proyectos</h1>
        <div className="user-info">
          <span>👋 {user.nombre} ({user.rol})</span>
          <button onClick={() => onNavigate('projects')} className="nav-btn">📋 Proyectos</button>
          <button onClick={onLogout} className="logout-btn">🚪 Cerrar Sesión</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="stats-cards">
          <div className="stat-card">
            <h3>📁 Proyectos</h3>
            <p className="stat-number">{stats.projects.total}</p>
            <div className="stat-details">
              <span>✅ {stats.projects.completados} completados</span>
              <span>🔄 {stats.projects.enProgreso} activos</span>
            </div>
          </div>
          <div className="stat-card">
            <h3>✅ Tareas</h3>
            <p className="stat-number">{stats.tasks.total}</p>
            <div className="stat-details">
              <span>✔️ {stats.tasks.completadas} completadas</span>
              <span>⏳ {stats.tasks.pendientes} pendientes</span>
            </div>
          </div>
          <div className="stat-card">
            <h3>📈 Progreso</h3>
            <p className="stat-number">
              {stats.projects.total > 0 
                ? Math.round((stats.projects.completados / stats.projects.total) * 100) 
                : 0}%
            </p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${stats.projects.total > 0 ? (stats.projects.completados / stats.projects.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h3>📊 Estado de Proyectos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>📋 Estado de Tareas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>⚠️ Tareas por Prioridad</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="prioridad" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cantidad" fill="#8884d8">
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="recent-tasks">
          <h3>📝 Tareas Recientes</h3>
          {stats.recentTasks.length === 0 ? (
            <p>No hay tareas recientes</p>
          ) : (
            <table className="tasks-table">
              <thead>
                <tr><th>Título</th><th>Proyecto</th><th>Estado</th><th>Prioridad</th><th>Fecha</th></tr>
              </thead>
              <tbody>
                {stats.recentTasks.map(task => (
                  <tr key={task._id}>
                    <td>{task.titulo}</td>
                    <td>{task.proyecto?.nombre || 'N/A'}</td>
                    <td><span className={`status-badge status-${task.estado.replace(/ /g, '-')}`}>{task.estado}</span></td>
                    <td><span className={`priority-badge priority-${task.prioridad}`}>{task.prioridad}</span></td>
                    <td>{new Date(task.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;