const emailService = require('../services/email.service');
const { v4: uuidv4 } = require('uuid');

// In-memory data store para MVP
// En producción, reemplazar con MongoDB (Mongoose) o similar.
let orders = [
  { 
    id: 'a87d6b00', 
    nombre: 'Julieta Martínez', 
    telefono: '1145678912', 
    direccion: 'Av. Corrientes 1234, CABA', 
    lat: -34.6037, lng: -58.3816, 
    desde: '10:00', hasta: '12:00', 
    estado: 'Entregado', 
    estadoPago: 'Pagado',
    fecha: new Date().toLocaleDateString('sv-SE'), 
    paquete: '1 × Pack Clásico, 1 × Pack Individual', 
    pago: 'transferencia' 
  },
  { 
    id: 'acfc5813', 
    nombre: 'Ricardo Darín', 
    telefono: '1123456789', 
    direccion: 'Tucumán 850, CABA', 
    lat: -34.5985, lng: -58.3782, 
    desde: '08:30', hasta: '09:30', 
    estado: 'Pendiente', 
    estadoPago: 'Pendiente',
    fecha: new Date().toLocaleDateString('sv-SE'), 
    paquete: '2 × Pack Media Docena', 
    pago: 'efectivo' 
  },
  { 
    id: '3f43a837', 
    nombre: 'Lionel Messi', 
    telefono: '1198765432', 
    direccion: 'Thames 300, CABA', 
    lat: -34.5921, lng: -58.4285, 
    desde: '11:00', hasta: '12:30', 
    estado: 'Pendiente', 
    estadoPago: 'Pendiente',
    fecha: new Date().toLocaleDateString('sv-SE'), 
    paquete: '1 × Pack Familiar', 
    pago: 'transferencia' 
  },
  { 
    id: 'd9e1a2b3', 
    nombre: 'Mariana Enríquez', 
    telefono: '1134567890', 
    direccion: 'Av. Santa Fe 2500, CABA', 
    lat: -34.5947, lng: -58.4027, 
    desde: '09:00', hasta: '11:00', 
    estado: 'Pendiente', 
    estadoPago: 'Pendiente',
    fecha: new Date().toLocaleDateString('sv-SE'), 
    paquete: '1 × Pack Clásico', 
    pago: 'transferencia' 
  },
  { 
    id: 'e2f3g4h5', 
    nombre: 'Charly García', 
    telefono: '1156789012', 
    direccion: 'Av. Rivadavia 5000, CABA', 
    lat: -34.6190, lng: -58.4385, 
    desde: '14:00', hasta: '16:00', 
    estado: 'Pendiente', 
    estadoPago: 'Pagado',
    fecha: new Date().toLocaleDateString('sv-SE'), 
    paquete: '3 × Pack Individual', 
    pago: 'transferencia' 
  },
  { 
    id: 'i6j7k8l9', 
    nombre: 'Marta Minujín', 
    telefono: '1178901234', 
    direccion: 'Av. Pueyrredón 1000, CABA', 
    lat: -34.5996, lng: -58.4030, 
    desde: '10:00', hasta: '11:30', 
    estado: 'Pendiente', 
    estadoPago: 'Pendiente',
    fecha: new Date().toLocaleDateString('sv-SE'), 
    paquete: '1 × Pack Media Docena', 
    pago: 'efectivo' 
  },
  { 
    id: 'm0n1o2p3', 
    nombre: 'Luis Alberto Spinetta', 
    telefono: '1190123456', 
    direccion: 'Av. Belgrano 2000, CABA', 
    lat: -34.6141, lng: -58.3971, 
    desde: '08:00', hasta: '10:00', 
    estado: 'Pendiente', 
    estadoPago: 'Pagado',
    fecha: new Date().toLocaleDateString('sv-SE'), 
    paquete: '2 × Pack Clásico', 
    pago: 'transferencia' 
  },
  { 
    id: 'q4r5s6t7', 
    nombre: 'Tini Stoessel', 
    telefono: '1121234567', 
    direccion: 'Av. Cabildo 1500, CABA', 
    lat: -34.5683, lng: -58.4485, 
    desde: '12:00', hasta: '14:00', 
    estado: 'Pendiente', 
    estadoPago: 'Pendiente',
    fecha: new Date().toLocaleDateString('sv-SE'), 
    paquete: '1 × Pack Familiar', 
    pago: 'transferencia' 
  },
  { 
    id: 'u8v9w0x1', 
    nombre: 'Gustavo Cerati', 
    telefono: '1143456789', 
    direccion: 'Av. Libertador 3000, CABA', 
    lat: -34.5772, lng: -58.4054, 
    desde: '09:30', hasta: '11:00', 
    estado: 'Pendiente', 
    estadoPago: 'Pendiente',
    fecha: new Date().toLocaleDateString('sv-SE'), 
    paquete: '1 × Pack Media Docena', 
    pago: 'efectivo' 
  },
  { 
    id: 'y2z3a4b5', 
    nombre: 'Fito Páez', 
    telefono: '1165678901', 
    direccion: 'Av. Entre Ríos 500, CABA', 
    lat: -34.6128, lng: -58.3925, 
    desde: '15:00', hasta: '17:00', 
    estado: 'Pendiente', 
    estadoPago: 'Pagado',
    fecha: new Date().toLocaleDateString('sv-SE'), 
    paquete: '2 × Pack Individual', 
    pago: 'transferencia' 
  },
  { 
    id: 'c6d7e8f9', 
    nombre: 'Lali Espósito', 
    telefono: '1187890123', 
    direccion: 'Av. Callao 1200, CABA', 
    lat: -34.5939, lng: -58.3908, 
    desde: '11:00', hasta: '13:00', 
    estado: 'Pendiente', 
    estadoPago: 'Pendiente',
    fecha: new Date().toLocaleDateString('sv-SE'), 
    paquete: '1 × Pack Clásico', 
    pago: 'efectivo' 
  },
  { 
    id: 'g0h1i2j3', 
    nombre: 'Manu Ginóbili', 
    telefono: '1112345678', 
    direccion: 'Av. San Martín 2500, CABA', 
    lat: -34.6042, lng: -58.4725, 
    desde: '10:00', hasta: '12:00', 
    estado: 'Pendiente', 
    estadoPago: 'Pagado',
    fecha: new Date().toLocaleDateString('sv-SE'), 
    paquete: '1 × Pack Familiar', 
    pago: 'transferencia' 
  },
  { 
    id: 'k4l5m6n7', 
    nombre: 'Gabriela Sabatini', 
    telefono: '1134567891', 
    direccion: 'Av. Córdoba 4000, CABA', 
    lat: -34.5978, lng: -58.4230, 
    desde: '09:00', hasta: '10:30', 
    estado: 'Pendiente', 
    estadoPago: 'Pendiente',
    fecha: new Date().toLocaleDateString('sv-SE'), 
    paquete: '2 × Pack Media Docena', 
    pago: 'transferencia' 
  },
  { 
    id: 'o8p9q0r1', 
    nombre: 'Diego Maradona', 
    telefono: '1156789012', 
    direccion: 'Av. Juan B. Justo 3000, CABA', 
    lat: -34.6033, lng: -58.4525, 
    desde: '13:00', hasta: '15:00', 
    estado: 'Pendiente', 
    estadoPago: 'Pagado',
    fecha: new Date().toLocaleDateString('sv-SE'), 
    paquete: '3 × Pack Clásico', 
    pago: 'transferencia' 
  },
  { 
    id: 's2t3u4v5', 
    nombre: 'Astor Piazzolla', 
    telefono: '1178901234', 
    direccion: 'Av. Triunvirato 4500, CABA', 
    lat: -34.5725, lng: -58.4862, 
    desde: '08:30', hasta: '10:00', 
    estado: 'Pendiente', 
    estadoPago: 'Pendiente',
    fecha: new Date().toLocaleDateString('sv-SE'), 
    paquete: '1 × Pack Individual', 
    pago: 'efectivo' 
  },
  { 
    id: 'w6x7y8z9', 
    nombre: 'Quino', 
    telefono: '1190123456', 
    direccion: 'Av. Boedo 800, CABA', 
    lat: -34.6219, lng: -58.4168, 
    desde: '16:00', hasta: '18:00', 
    estado: 'Pendiente', 
    estadoPago: 'Pendiente',
    fecha: new Date().toLocaleDateString('sv-SE'), 
    paquete: '2 × Pack Media Docena', 
    pago: 'transferencia' 
  },
  { 
    id: 'a1b2c3d4', 
    nombre: 'Juan Manuel Fangio', 
    telefono: '1121234567', 
    direccion: 'Av. Caseros 2000, CABA', 
    lat: -34.6360, lng: -58.3915, 
    desde: '11:00', hasta: '12:30', 
    estado: 'Pendiente', 
    estadoPago: 'Pagado',
    fecha: new Date().toLocaleDateString('sv-SE'), 
    paquete: '1 × Pack Clásico', 
    pago: 'transferencia' 
  },
  { 
    id: 'e5f6g7h8', 
    nombre: 'Mercedes Sosa', 
    telefono: '1143456789', 
    direccion: 'Av. Montes de Oca 1000, CABA', 
    lat: -34.6321, lng: -58.3789, 
    desde: '09:30', hasta: '11:30', 
    estado: 'Pendiente', 
    estadoPago: 'Pendiente',
    fecha: new Date().toLocaleDateString('sv-SE'), 
    paquete: '1 × Pack Familiar', 
    pago: 'efectivo' 
  },
];

exports.createOrder = async (req, res) => {
  try {
    if (!global.config.formularioAbierto) {
      return res.status(403).json({ message: 'El horario de pedidos está cerrado por hoy.' });
    }
    const { nombre, telefono, paquete, pago, direccion, lat, lng } = req.body;
    
    // Si no envían coords, podemos asignar unas por defecto o usar un geocoder
    // Para simplificar, le ponemos unas random cerca de CABA si no hay
    const defaultLat = -34.6 + (Math.random() * 0.05 - 0.025);
    const defaultLng = -58.4 + (Math.random() * 0.05 - 0.025);

    const newOrder = {
      id: Math.random().toString(36).substring(2, 10),
      nombre,
      telefono,
      paquete: paquete,
      pago,
      direccion: direccion || 'Dirección no provista',
      lat: lat ? Number(lat) : defaultLat,
      lng: lng ? Number(lng) : defaultLng,
      desde: req.body.desde || '10:00',
      hasta: req.body.hasta || '12:00',
      estado: 'Pendiente',
      fecha: new Date().toLocaleDateString('sv-SE'),
      comprobante: req.file ? req.file.filename : null,
      createdAt: new Date().toLocaleString('sv-SE')
    };

    orders.push(newOrder);

    // Enviar email asíncronamente
    emailService.sendOrderEmail(newOrder);

    res.status(201).json({ message: 'Pedido creado exitosamente', order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el pedido' });
  }
};

exports.getOrders = (req, res) => {
  res.json(orders);
};

exports.updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const orderIndex = orders.findIndex(o => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ message: 'Pedido no encontrado' });
  }
  
  // Actualizar cualquier campo que venga en el body
  orders[orderIndex] = { ...orders[orderIndex], ...updates };
  
  res.json({ message: 'Pedido actualizado', order: orders[orderIndex] });
};

exports.deleteOrder = (req, res) => {
  const { id } = req.params;
  
  const orderIndex = orders.findIndex(o => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ message: 'Pedido no encontrado' });
  }
  
  orders.splice(orderIndex, 1);
  res.json({ message: 'Pedido eliminado' });
};
