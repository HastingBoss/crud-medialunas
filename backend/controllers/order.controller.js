const emailService = require('../services/email.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createOrder = async (req, res) => {
  try {
    if (!global.config.formularioAbierto) {
      return res.status(403).json({ message: 'El horario de pedidos está cerrado por hoy.' });
    }
    const { nombre, telefono, paquete, pago, direccion, lat, lng, desde, hasta, fecha } = req.body;
    
    // Si no envían coords, podemos asignar unas por defecto o usar un geocoder
    // Para simplificar, le ponemos unas random cerca de CABA si no hay
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
      comprobante: req.file ? req.file.filename : null,
    };

    const newOrder = await prisma.pedido.create({
      data: newOrderData
    });

    // Enviar email asíncronamente
    emailService.sendOrderEmail(newOrder);

    res.status(201).json({ message: 'Pedido creado exitosamente', order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Error al crear el pedido' });
  }
};

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
