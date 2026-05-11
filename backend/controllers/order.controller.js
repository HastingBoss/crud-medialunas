const emailService = require('../services/email.service');
const { v4: uuidv4 } = require('uuid');

// In-memory data store para MVP
// En producción, reemplazar con MongoDB (Mongoose) o similar.
let orders = [
  // Datos mockeados iniciales (zona CABA)
  { id: 'a87d6b00', nombre: 'María Gabriela', telefono: '1112345678', direccion: 'Av. Corrientes 1234, CABA', lat: -34.6037, lng: -58.3816, desde: '09:00', hasta: '09:30', estado: 'Entregado', fecha: new Date().toISOString().split('T')[0], paquete: 12, pago: 'efectivo' },
  { id: 'acfc5813', nombre: 'Maria Gabriela', telefono: '1112345678', direccion: 'Tucumán 850, CABA', lat: -34.5985, lng: -58.3782, desde: '10:00', hasta: '11:00', estado: 'Pendiente', fecha: new Date().toISOString().split('T')[0], paquete: 24, pago: 'transferencia' },
  { id: '3f43a837', nombre: 'Enzo', telefono: '1112345678', direccion: 'Thames 300, CABA', lat: -34.5921, lng: -58.4285, desde: '12:00', hasta: '13:00', estado: 'Pendiente', fecha: new Date().toISOString().split('T')[0], paquete: 12, pago: 'efectivo' },
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
  const { estado, estadoPago } = req.body;
  
  const orderIndex = orders.findIndex(o => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ message: 'Pedido no encontrado' });
  }
  
  if (estado !== undefined) orders[orderIndex].estado = estado;
  if (estadoPago !== undefined) orders[orderIndex].estadoPago = estadoPago;
  
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
