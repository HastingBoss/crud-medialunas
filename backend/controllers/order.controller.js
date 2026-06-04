const emailService = require('../services/email.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear un nuevo pedido del cliente en la base de datos
exports.createOrder = async (req, res) => {
  try {
    // Validar si el formulario está actualmente abierto para tomar pedidos
    if (!global.config.formularioAbierto) {
      return res.status(403).json({ message: 'El horario de pedidos está cerrado por hoy.' });
    }
    const { nombre, telefono, paquete, pago, direccion, lat, lng, desde, hasta, fecha } = req.body;
    
    // Si el usuario no selecciona una sugerencia del mapa con coordenadas,
    // se asignan coordenadas aleatorias en el área de CABA para visualización
    const defaultLat = -34.6 + (Math.random() * 0.05 - 0.025);
    const defaultLng = -58.4 + (Math.random() * 0.05 - 0.025);

    const newOrderData = {
      nombre,
      telefono,
      paquete,
      pago,
      direccion: direccion || 'Dirección no provista',
      lat: lat ? Number(lat) : defaultLat,
      lng: lng ? Number(lng) : defaultLng,
      desde: desde || '10:00',
      hasta: hasta || '12:00',
      fecha: fecha || new Date().toLocaleDateString('sv-SE'),
      comprobante: req.file ? req.file.filename : null, // Nombre del archivo subido (si existe)
    };

    const newOrder = await prisma.pedido.create({
      data: newOrderData
    });

    // Enviar correo de notificación del pedido de manera asíncrona para no bloquear la respuesta HTTP
    emailService.sendOrderEmail(newOrder);

    res.status(201).json({ message: 'Pedido creado exitosamente', order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Error al crear el pedido' });
  }
};

// Obtener la lista completa de pedidos ordenados por fecha de creación descendente
exports.getOrders = async (req, res) => {
  try {
    const orders = await prisma.pedido.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Error al obtener los pedidos' });
  }
};

// Actualizar campos específicos de un pedido (ej: estado de entrega, estado de pago o archivado)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedOrder = await prisma.pedido.update({
      where: { id },
      data: updates
    });
    
    res.json({ message: 'Pedido actualizado', order: updatedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Error al actualizar el pedido' });
  }
};

// Eliminar permanentemente un pedido de la base de datos
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.pedido.delete({
      where: { id }
    });
    
    res.json({ message: 'Pedido eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Error al eliminar el pedido' });
  }
};
