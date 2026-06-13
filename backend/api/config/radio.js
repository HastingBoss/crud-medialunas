const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

module.exports = async (req, res) => {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'PUT') {
    if (!req.body || typeof req.body === 'undefined') {
      await new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try { req.body = JSON.parse(body); } catch { req.body = {}; }
          resolve();
        });
        req.on('error', reject);
      });
    }
    const { radioKm } = req.body;
    if (!radioKm || isNaN(parseFloat(radioKm))) {
      return res.status(400).json({ message: 'radioKm debe ser un número válido' });
    }
    const config = await prisma.config.upsert({
      where: { id: 1 },
      update: { radioKm: parseFloat(radioKm) },
      create: { id: 1, horarioCierre: '05:00', forzadoCerrado: false, radioKm: parseFloat(radioKm) }
    });
    return res.json({ message: 'Radio actualizado', radioKm: config.radioKm });
  }

  res.status(405).json({ message: 'Método no permitido' });
};
