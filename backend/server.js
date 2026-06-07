const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const statsRoutes = require('./routes/stats');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/gestion_proyectos')
  .then(() => console.log('✅ Conectado a MongoDB Local'))
  .catch(err => console.error('❌ Error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);

app.get('/api/test', (req, res) => {
  res.json({ mensaje: 'API funcionando!' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});