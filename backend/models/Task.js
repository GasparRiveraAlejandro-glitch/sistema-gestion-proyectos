const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String },
  estado: { type: String, enum: ['pendiente', 'en progreso', 'revisión', 'completada'], default: 'pendiente' },
  prioridad: { type: String, enum: ['baja', 'media', 'alta'], default: 'media' },
  fechaLimite: { type: Date },
  proyecto: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  asignadoA: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);