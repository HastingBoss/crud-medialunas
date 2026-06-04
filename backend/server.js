// Configuración de zona horaria por defecto para la consistencia en el manejo de fechas
process.env.TZ = 'America/Argentina/Buenos_Aires';

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Asegurar la existencia del directorio para almacenar comprobantes de pago subidos por usuarios
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Importar enrutadores de los diferentes recursos de la aplicación
const orderRoutes = require('./routes/order.routes');
const priceRoutes = require('./routes/price.routes');
const stockRoutes = require('./routes/stock.routes');
const cron = require('node-cron');

// Estado global en memoria para controlar la apertura y horario de corte del formulario
global.config = {
  formularioAbierto: true,
  horarioCierre: '05:00'
};

// Tarea programada (Cron): Abre automáticamente el formulario de pedidos todos los días a las 00:00
cron.schedule('0 0 * * *', () => {
  global.config.formularioAbierto = true;
  console.log('Formulario abierto automáticamente (00:00)');
});

// Programación dinámica de la tarea de cierre de formulario basado en la hora especificada
let closingJob;
function scheduleClosing(time) {
  if (closingJob) closingJob.stop(); // Detener tarea previa si existía
  const [hour, minute] = time.split(':');
  // Programa la tarea para ejecutarse a los minutos y horas indicados todos los días
  closingJob = cron.schedule(`${minute} ${hour} * * *`, () => {
    global.config.formularioAbierto = false;
    console.log(`Formulario cerrado automáticamente (${time})`);
  });
}

// Programar horario de cierre inicial por defecto (05:00 AM)
scheduleClosing(global.config.horarioCierre);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Servir estáticamente los comprobantes de pago subidos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas de la API de pedidos, precios y stock
app.use('/api/orders', orderRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/stock', stockRoutes);

// Endpoint GET: Obtener configuración actual del estado del formulario y horario de corte
app.get('/api/config/estado', (req, res) => {
  res.json(global.config);
});

// Endpoint PUT: Extender o modificar dinámicamente el horario de cierre del formulario
app.put('/api/config/extender', (req, res) => {
  const { horaExtencion } = req.body; // Formato HH:MM esperado
  if (!horaExtencion) {
    return res.status(400).json({ message: 'Debe proveer horaExtencion (HH:MM)' });
  }
  global.config.horarioCierre = horaExtencion;
  scheduleClosing(horaExtencion); // Reprogramar el cierre dinámico con la nueva hora
  res.json({ message: 'Horario de cierre extendido', config: global.config });
});

// Endpoint GET: Obtener hora actual del servidor en formato ISO y formato local sueco (YYYY-MM-DD HH:MM:SS)
app.get('/api/time', (req, res) => {
  const now = new Date();
  res.json({
    serverTime: now.toISOString(),
    formatted: now.toLocaleString('sv-SE'),
    timezone: process.env.TZ
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
