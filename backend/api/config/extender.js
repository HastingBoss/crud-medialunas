const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PUT,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function getArgentinaDate() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' });
}

module.exports = async (req, res) => {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'PUT') {
    const { horaExtencion } = req.body;
    if (!horaExtencion) return res.status(400).json({ message: 'Debe proveer horaExtencion (HH:MM)' });
    const config = await prisma.config.upsert({
      where: { id: 1 },
      update: { horarioCierre: horaExtencion, forzadoCerrado: false, fechaForzado: null },
      create: { id: 1, horarioCierre: horaExtencion, forzadoCerrado: false }
    });
    return res.json({ message: 'Horario de cierre actualizado', config });
  }

  if (req.method === 'POST') {
    const config = await prisma.config.upsert({
      where: { id: 1 },
      update: { forzadoCerrado: true, fechaForzado: getArgentinaDate() },
      create: { id: 1, horarioCierre: '05:00', forzadoCerrado: true, fechaForzado: getArgentinaDate() }
    });
    return res.json({ message: 'Formulario cerrado manualmente', config });
  }

  res.status(405).json({ message: 'Método no permitido' });
};
