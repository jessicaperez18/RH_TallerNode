require('dotenv').config();
const express = require('express');
const cors = require('cors');

const user = require('./routes/user');
const rh = require('./routes/rh');

const app = express();
const PORT = process.env.PORT || 3000;

// Falla al arrancar si falta la clave del token
if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en el archivo .env');
  process.exit(1);
}

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor funcionando' });
});

// Routers
app.use('/usuarios', user);
app.use('/empleados', rh);

// Ruta no encontrada (404 en JSON, no en HTML)
app.use((req, res) => {
  res.status(404).json({ code: 404, message: 'Ruta no encontrada' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ code: 500, message: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});