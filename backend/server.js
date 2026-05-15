process.env.TZ = 'America/Argentina/Buenos_Aires';
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const orderRoutes = require('./routes/order.routes');
const priceRoutes = require('./routes/price.routes');
const stockRoutes = require('./routes/stock.routes');
const cron = require('node-cron');

// Estado global para horario de corte
global.config = {
  formularioAbierto: true,
  horarioCierre: '05:00'
};

// Tarea para abrir el formulario a las 00:00
cron.schedule('0 0 * * *', () => {
  global.config.formularioAbierto = true;
  console.log('Formulario abierto (00:00)');
});

// Tarea para cerrar el formulario (dinámica)
let closingJob;
function scheduleClosing(time) {
  if (closingJob) closingJob.stop();
  const [hour, minute] = time.split(':');
  closingJob = cron.schedule(`${minute} ${hour} * * *`, () => {
    global.config.formularioAbierto = false;
    console.log(`Formulario cerrado (${time})`);
  });
}

// Programar cierre inicial (05:00)
scheduleClosing(global.config.horarioCierre);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
// Servir archivos estáticos de comprobantes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/orders', orderRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/stock', stockRoutes);

// Endpoints de configuración de horario de corte
app.get('/api/config/estado', (req, res) => {
  res.json(global.config);
});

app.put('/api/config/extender', (req, res) => {
  const { horaExtencion } = req.body; // Formato HH:MM
  if (!horaExtencion) {
    return res.status(400).json({ message: 'Debe proveer horaExtencion (HH:MM)' });
  }
  global.config.horarioCierre = horaExtencion;
  scheduleClosing(horaExtencion);
  res.json({ message: 'Horario de cierre extendido', config: global.config });
});

app.get('/api/time', (req, res) => {
  const now = new Date();
  res.json({
    serverTime: now.toISOString(),
    formatted: now.toLocaleString('sv-SE'),
    timezone: process.env.TZ
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
