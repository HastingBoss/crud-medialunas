const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function getArgentinaDate() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' });
}

function getArgentinaHour() {
  return parseInt(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires', hour: 'numeric', hour12: false }));
}

async function isFormularioAbierto() {
  const config = await prisma.config.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, horarioCierre: '05:00', forzadoCerrado: false }
  });
  const hoy = getArgentinaDate();
  if (config.cierreHasta && config.cierreHasta >= hoy) return false;
  return true;
}

module.exports = async (req, res) => {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const orders = await prisma.pedido.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(orders);
  }

  if (req.method === 'POST') {
    const abierto = await isFormularioAbierto();
    if (!abierto) return res.status(403).json({ message: 'El horario de pedidos está cerrado por hoy.' });

    const { nombre, telefono, paquete, pago, direccion, lat, lng, desde, hasta, fecha } = req.body;
    const newOrder = await prisma.pedido.create({
      data: {
        nombre, telefono, paquete, pago,
        direccion: direccion || 'Dirección no provista',
        lat: lat ? Number(lat) : -34.6 + (Math.random() * 0.05 - 0.025),
        lng: lng ? Number(lng) : -58.4 + (Math.random() * 0.05 - 0.025),
        desde: desde || '10:00',
        hasta: hasta || '12:00',
        fecha: fecha || getArgentinaDate(),
      }
    });
    return res.status(201).json({ message: 'Pedido creado exitosamente', order: newOrder });
  }

  res.status(405).json({ message: 'Método no permitido' });
};
