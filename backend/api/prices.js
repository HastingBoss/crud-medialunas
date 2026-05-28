const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

module.exports = async (req, res) => {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const prices = await prisma.precios.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, individual: 2200, media: 3800, clasico: 6800, familiar: 12500 }
    });
    return res.json(prices);
  }

  if (req.method === 'PUT') {
    const keys = ['individual', 'media', 'clasico', 'familiar'];
    const body = req.body;
    for (const key of keys) {
      if (body[key] === undefined || isNaN(Number(body[key]))) {
        return res.status(400).json({ message: `Precio para ${key} es inválido o falta` });
      }
    }
    const data = Object.fromEntries(keys.map(k => [k, Number(body[k])]));
    const prices = await prisma.precios.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data }
    });
    return res.json({ message: 'Precios actualizados exitosamente', prices });
  }

  res.status(405).json({ message: 'Método no permitido' });
};
