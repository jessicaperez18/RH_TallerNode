require('dotenv').config();
const express = require('express');

const cors = require('./middleware/cors');
const index = require('./middleware/index');
const notFound = require('./middleware/notFound');
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
app.use(cors);
app.use(express.json());

// Ruta de bienvenida
app.get('/', index);

// Routers
app.use('/usuarios', user);
app.use('/empleados', rh);

// Ruta no encontrada (404 en JSON, no en HTML)
app.use(notFound);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ code: 500, message: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});