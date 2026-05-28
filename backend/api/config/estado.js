const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function getArgentinaDate() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' });
}

function getArgentinaHour() {
  return parseInt(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires', hour: 'numeric', hour12: false }));
}

module.exports = async (req, res) => {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();

  const config = await prisma.config.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, horarioCierre: '05:00', forzadoCerrado: false }
  });

  const hoy = getArgentinaDate();
  let formularioAbierto;

  if (config.forzadoCerrado && config.fechaForzado === hoy) {
    formularioAbierto = false;
  } else {
    const [closeHour] = config.horarioCierre.split(':').map(Number);
    formularioAbierto = getArgentinaHour() >= 0 && getArgentinaHour() < closeHour;
  }

  res.json({ formularioAbierto, horarioCierre: config.horarioCierre, forzadoCerrado: config.forzadoCerrado });
};
