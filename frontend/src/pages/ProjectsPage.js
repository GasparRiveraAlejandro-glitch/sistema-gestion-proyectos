import React, { useState, useEffect } from 'react';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import userService from '../services/userService';

function ProjectsPage({ user, onNavigate, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectFormData, setProjectFormData] = useState({ nombre: '', descripcion: '', fechaFin: '' });
  const [message, setMessage] = useState('');
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'media',
    fechaLimite: ''
  });

  // Estados para miembros
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [creator, setCreator] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (error) {
      setMessage('Error al cargar proyectos');
    }
  };

  const loadTasks = async (projectId) => {
    try {
      const data = await taskService.getTasksByProject(projectId);
      setTasks(data);
    } catch (error) {
      setMessage('Error al cargar tareas');
    }
  };

  const loadMembers = async (projectId) => {
    try {
      const data = await userService.getProjectMembers(projectId);
      setCreator(data.creador);
      setMembers(data.miembros);
    } catch (error) {
      setMessage('Error al cargar miembros');
    }
  };

  const handleSearchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await userService.searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await userService.addMember(selectedProject._id, userId);
      loadMembers(selectedProject._id);
      setSearchQuery('');
      setSearchResults([]);
      setMessage('✅ Miembro agregado');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error al agregar miembro');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('¿Eliminar este miembro del proyecto?')) {
      try {
        await userService.removeMember(selectedProject._id, userId);
        loadMembers(selectedProject._id);
        setMessage('✅ Miembro eliminado');
      } catch (error) {
        setMessage('Error al eliminar miembro');
      }
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await projectService.updateProject(editingProject._id, projectFormData);
        setMessage('Proyecto actualizado');
      } else {
        await projectService.createProject(projectFormData);
        setMessage('Proyecto creado');
      }
      setShowProjectForm(false);
      setEditingProject(null);
      setProjectFormData({ nombre: '', descripcion: '', fechaFin: '' });
      loadProjects();
    } catch (error) {
      setMessage('Error al guardar proyecto');
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await taskService.updateTask(editingTask._id, taskFormData);
        setMessage('Tarea actualizada');
      } else {
        await taskService.createTask({ ...taskFormData, proyecto: selectedProject._id });
        setMessage('Tarea creada');
      }
      setShowTaskForm(false);
      setEditingTask(null);
      setTaskFormData({ titulo: '', descripcion: '', prioridad: 'media', fechaLimite: '' });
      loadTasks(selectedProject._id);
    } catch (error) {
      setMessage('Error al guardar tarea');
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('¿Eliminar este proyecto y todas sus tareas?')) {
      await projectService.deleteProject(id);
      loadProjects();
      if (selectedProject?._id === id) {
        setSelectedProject(null);
        setTasks([]);
      }
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('¿Eliminar esta tarea?')) {
      await taskService.deleteTask(id);
      loadTasks(selectedProject._id);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskFormData({
      titulo: task.titulo,
      descripcion: task.descripcion || '',
      prioridad: task.prioridad,
      fechaLimite: task.fechaLimite?.split('T')[0] || ''
    });
    setShowTaskForm(true);
  };

  const getPrioridadColor = (prioridad) => {
    switch(prioridad) {
      case 'alta': return 'red';
      case 'media': return 'orange';
      default: return 'green';
    }
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'completada': return 'green';
      case 'en progreso': return 'orange';
      case 'revisión': return 'purple';
      default: return 'gray';
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    await taskService.updateTask(taskId, { estado: newStatus });
    loadTasks(selectedProject._id);
  };

  // Verificar si el usuario puede gestionar miembros (creador o admin)
  const canManageMembers = selectedProject && (selectedProject.creadoPor === user._id || user.rol === 'admin');

  return (
    <div className="projects-container">
      <header className="projects-header">
        <h1>📊 Sistema de Gestión de Proyectos</h1>
        <div className="user-info">
          <span>👋 {user.nombre} ({user.rol})</span>
          <button onClick={() => onNavigate('dashboard')} className="nav-btn">📊 Dashboard</button>
          <button onClick={onLogout} className="logout-btn">🚪 Cerrar Sesión</button>
        </div>
      </header>

      <div className="projects-content">
        {message && <p className="message">{message}</p>}
        
        <div className="projects-section">
          <h2>Mis Proyectos</h2>
          <button onClick={() => { setShowProjectForm(true); setEditingProject(null); setProjectFormData({ nombre: '', descripcion: '', fechaFin: '' }); }} className="btn-primary">
            + Nuevo Proyecto
          </button>

          {showProjectForm && (
            <form onSubmit={handleProjectSubmit} className="project-form">
              <h3>{editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h3>
              <input
                type="text"
                placeholder="Nombre del proyecto"
                value={projectFormData.nombre}
                onChange={(e) => setProjectFormData({...projectFormData, nombre: e.target.value})}
                required
              />
              <textarea
                placeholder="Descripción"
                value={projectFormData.descripcion}
                onChange={(e) => setProjectFormData({...projectFormData, descripcion: e.target.value})}
              />
              <input
                type="date"
                value={projectFormData.fechaFin}
                onChange={(e) => setProjectFormData({...projectFormData, fechaFin: e.target.value})}
              />
              <div className="form-buttons">
                <button type="submit">Guardar</button>
                <button type="button" onClick={() => { setShowProjectForm(false); setEditingProject(null); }}>Cancelar</button>
              </div>
            </form>
          )}

          <div className="projects-grid">
            {projects.map(project => (
              <div key={project._id} className="project-card" onClick={() => { setSelectedProject(project); loadTasks(project._id); }}>
                <h3>{project.nombre}</h3>
                <p>{project.descripcion}</p>
                <p className="estado" style={{ color: getEstadoColor(project.estado) }}>
                  📌 {project.estado}
                </p>
                <div className="card-buttons">
                  <button onClick={(e) => { e.stopPropagation(); setSelectedProject(project); setShowTaskForm(true); setEditingTask(null); setTaskFormData({ titulo: '', descripcion: '', prioridad: 'media', fechaLimite: '' }); }}>📋 Agregar Tarea</button>
                  <button onClick={(e) => { e.stopPropagation(); setEditingProject(project); setProjectFormData({ nombre: project.nombre, descripcion: project.descripcion || '', fechaFin: project.fechaFin?.split('T')[0] || '' }); setShowProjectForm(true); }}>✏️ Editar</button>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedProject(project); loadMembers(project._id); setShowMembersModal(true); }} className="members-btn">👥 Miembros</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(project._id); }} className="delete">🗑️ Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedProject && (
          <div className="tasks-section">
            <h2>📋 Tareas de: {selectedProject.nombre}</h2>
            
            {showTaskForm && (
              <form onSubmit={handleTaskSubmit} className="task-form">
                <h3>{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</h3>
                <input
                  type="text"
                  placeholder="Título de la tarea"
                  value={taskFormData.titulo}
                  onChange={(e) => setTaskFormData({...taskFormData, titulo: e.target.value})}
                  required
                />
                <textarea
                  placeholder="Descripción"
                  value={taskFormData.descripcion}
                  onChange={(e) => setTaskFormData({...taskFormData, descripcion: e.target.value})}
                />
                <select
                  value={taskFormData.prioridad}
                  onChange={(e) => setTaskFormData({...taskFormData, prioridad: e.target.value})}
                >
                  <option value="baja">🟢 Baja</option>
                  <option value="media">🟡 Media</option>
                  <option value="alta">🔴 Alta</option>
                </select>
                <input
                  type="date"
                  value={taskFormData.fechaLimite}
                  onChange={(e) => setTaskFormData({...taskFormData, fechaLimite: e.target.value})}
                />
                <div className="form-buttons">
                  <button type="submit">Guardar</button>
                  <button type="button" onClick={() => { setShowTaskForm(false); setEditingTask(null); }}>Cancelar</button>
                </div>
              </form>
            )}

            <div className="tasks-list">
              {tasks.map(task => (
                <div key={task._id} className="task-card">
                  <div className="task-header">
                    <h4>{task.titulo}</h4>
                    <span className="prioridad" style={{ color: getPrioridadColor(task.prioridad) }}>
                      {task.prioridad === 'alta' ? '🔴' : task.prioridad === 'media' ? '🟡' : '🟢'} {task.prioridad}
                    </span>
                  </div>
                  <p>{task.descripcion}</p>
                  <div className="task-status">
                    <label>Estado: </label>
                    <select
                      value={task.estado}
                      onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                      style={{ color: getEstadoColor(task.estado) }}
                    >
                      <option value="pendiente">⏳ Pendiente</option>
                      <option value="en progreso">🔄 En progreso</option>
                      <option value="revisión">📝 Revisión</option>
                      <option value="completada">✅ Completada</option>
                    </select>
                  </div>
                  {task.fechaLimite && (
                    <p className="fecha">📅 Límite: {new Date(task.fechaLimite).toLocaleDateString()}</p>
                  )}
                  <div className="card-buttons">
                    <button onClick={() => handleEditTask(task)}>✏️ Editar</button>
                    <button onClick={() => handleDeleteTask(task._id)} className="delete">🗑️ Eliminar</button>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && !showTaskForm && (
                <p className="no-tasks">No hay tareas. ¡Crea una!</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Miembros */}
      {showMembersModal && selectedProject && (
        <div className="modal-overlay" onClick={() => setShowMembersModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>👥 Miembros del Proyecto: {selectedProject.nombre}</h3>
            
            <div className="members-list">
              <div className="member-item creator">
                <div className="member-info">
                  <strong>👑 {creator?.nombre}</strong>
                  <span className="member-email">{creator?.email}</span>
                  <span className="member-role">Creador</span>
                </div>
              </div>
              
              {members.map(member => (
                <div key={member._id} className="member-item">
                  <div className="member-info">
                    <strong>{member.nombre}</strong>
                    <span className="member-email">{member.email}</span>
                    <span className="member-role">{member.rol}</span>
                  </div>
                  {canManageMembers && (
                    <button onClick={() => handleRemoveMember(member._id)} className="remove-member" title="Eliminar miembro">
                      ❌
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {canManageMembers && (
              <div className="add-member-section">
                <h4>➕ Agregar Miembro</h4>
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearchUsers(e.target.value);
                  }}
                />
                {searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map(userResult => (
                      <div key={userResult._id} className="search-result-item">
                        <span>
                          <strong>{userResult.nombre}</strong>
                          <span className="user-email">({userResult.email})</span>
                          <span className="user-role">{userResult.rol}</span>
                        </span>
                        <button onClick={() => handleAddMember(userResult._id)}>
                          ➕ Agregar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <button onClick={() => setShowMembersModal(false)} className="close-modal">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;