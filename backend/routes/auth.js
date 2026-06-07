const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    
    const user = new User({ nombre, email, password, rol });
    await user.save();

    const token = jwt.sign({ userId: user._id, rol: user.rol }, JWT_SECRET, { expiresIn: '7d' });

    const responsePayload = {
      token,
      user: { id: user._id, nombre: user.nombre, email: user.email, rol: user.rol }
    };

    console.log('StatusCode : 201');
    console.log('Content    : ' + JSON.stringify(responsePayload));

    res.status(201).json(responsePayload);
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign({ userId: user._id, rol: user.rol }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token, user: { id: user._id, nombre: user.nombre, email: user.email, rol: user.rol } });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;