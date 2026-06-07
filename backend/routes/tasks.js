const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Obtener tareas de un proyecto
router.get('/project/:projectId', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ proyecto: req.params.projectId })
      .populate('asignadoA', 'nombre email')
      .populate('creadoPor', 'nombre email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nueva tarea
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { titulo, descripcion, prioridad, fechaLimite, proyecto, asignadoA } = req.body;
    
    // Verificar que el proyecto existe
    const project = await Project.findById(proyecto);
    if (!project) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    
    const task = new Task({
      titulo,
      descripcion,
      prioridad,
      fechaLimite,
      proyecto,
      asignadoA,
      creadoPor: req.userId
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar tarea
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { titulo, descripcion, estado, prioridad, fechaLimite, asignadoA } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { titulo, descripcion, estado, prioridad, fechaLimite, asignadoA },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar tarea
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json({ mensaje: 'Tarea eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;