const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const orderRoutes = require('./routes/order.routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
// Servir archivos estáticos de comprobantes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/orders', orderRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
