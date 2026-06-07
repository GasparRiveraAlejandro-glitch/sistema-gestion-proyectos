const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Obtener estadísticas del usuario
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    // Proyectos del usuario
    const projects = await Project.find({
      $or: [{ creadoPor: req.userId }, { miembros: req.userId }]
    });

    // Tareas de los proyectos del usuario
    const projectIds = projects.map(p => p._id);
    const tasks = await Task.find({ proyecto: { $in: projectIds } });

    // Estadísticas de proyectos
    const projectStats = {
      total: projects.length,
      pendientes: projects.filter(p => p.estado === 'pendiente').length,
      enProgreso: projects.filter(p => p.estado === 'en progreso').length,
      completados: projects.filter(p => p.estado === 'completado').length
    };

    // Estadísticas de tareas
    const taskStats = {
      total: tasks.length,
      pendientes: tasks.filter(t => t.estado === 'pendiente').length,
      enProgreso: tasks.filter(t => t.estado === 'en progreso').length,
      revision: tasks.filter(t => t.estado === 'revisión').length,
      completadas: tasks.filter(t => t.estado === 'completada').length,
      porPrioridad: {
        baja: tasks.filter(t => t.prioridad === 'baja').length,
        media: tasks.filter(t => t.prioridad === 'media').length,
        alta: tasks.filter(t => t.prioridad === 'alta').length
      }
    };

    // Tareas recientes (últimas 5)
    const recentTasks = await Task.find({ proyecto: { $in: projectIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('proyecto', 'nombre');

    res.json({
      projects: projectStats,
      tasks: taskStats,
      recentTasks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;