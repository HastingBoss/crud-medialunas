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
    const stock = await prisma.stock.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, stock: 0, threshold: 10 }
    });
    return res.json(stock);
  }

  if (req.method === 'PUT') {
    const { value, threshold } = req.body;
    const data = {};
    if (typeof value === 'number') data.stock = value;
    if (typeof threshold === 'number') data.threshold = threshold;
    const stock = await prisma.stock.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, stock: value ?? 0, threshold: threshold ?? 10 }
    });
    return res.json({ message: 'Stock actualizado', ...stock });
  }

  res.status(405).json({ message: 'Método no permitido' });
};
