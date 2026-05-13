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
    fecha: new Date().toISOString().split('T')[0], 
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
    fecha: new Date().toISOString().split('T')[0], 
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
    fecha: new Date().toISOString().split('T')[0], 
    paquete: '1 × Pack Familiar', 
    pago: 'transferencia' 
  },
];

exports.createOrder = async (req, res) => {
  try {
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
      fecha: new Date().toISOString().split('T')[0],
      comprobante: req.file ? req.file.filename : null,
      createdAt: new Date().toISOString()
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
