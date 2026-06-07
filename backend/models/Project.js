const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  estado: { type: String, enum: ['pendiente', 'en progreso', 'completado'], default: 'pendiente' },
  fechaInicio: { type: Date, default: Date.now },
  fechaFin: { type: Date },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  miembros: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);