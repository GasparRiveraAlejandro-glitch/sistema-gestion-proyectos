const express = require('express');
const Project = require('../models/Project');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Obtener todos los proyectos del usuario
router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ creadoPor: req.userId }, { miembros: req.userId }]
    }).populate('creadoPor', 'nombre email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un proyecto por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('creadoPor', 'nombre email')
      .populate('miembros', 'nombre email');
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo proyecto
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre, descripcion, fechaFin, miembros } = req.body;
    const project = new Project({
      nombre,
      descripcion,
      fechaFin,
      creadoPor: req.userId,
      miembros: miembros || []
    });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar proyecto
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { nombre, descripcion, estado, fechaFin, miembros } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion, estado, fechaFin, miembros },
      { new: true }
    );
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar proyecto
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json({ mensaje: 'Proyecto eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;