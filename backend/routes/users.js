const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Buscar usuarios
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json([]);
    }
    
    const users = await User.find({
      _id: { $ne: req.userId },
      $or: [
        { nombre: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }).limit(10).select('_id nombre email rol');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener miembros de un proyecto
router.get('/project/:projectId/members', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('creadoPor', 'nombre email rol')
      .populate('miembros', 'nombre email rol');
    
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    res.json({
      creador: project.creadoPor,
      miembros: project.miembros
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agregar miembro
router.post('/project/:projectId/members', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    if (project.creadoPor.toString() !== req.userId && req.userRol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    if (project.miembros.includes(userId)) {
      return res.status(400).json({ error: 'Usuario ya es miembro' });
    }
    
    project.miembros.push(userId);
    await project.save();
    
    res.json({ mensaje: 'Miembro agregado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar miembro
router.delete('/project/:projectId/members/:userId', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    if (project.creadoPor.toString() !== req.userId && req.userRol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    
    project.miembros = project.miembros.filter(m => m.toString() !== req.params.userId);
    await project.save();
    
    res.json({ mensaje: 'Miembro eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;