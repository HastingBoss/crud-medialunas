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

    const { alias } = req.body;
    if (!alias || typeof alias !== 'string' || alias.trim() === '') {
      return res.status(400).json({ message: 'El alias no puede estar vacío' });
    }

    try {
      const config = await prisma.config.upsert({
        where: { id: 1 },
        update: { alias },
        create: { id: 1, horarioCierre: '05:00', forzadoCerrado: false, alias }
      });
      return res.json({ message: 'Alias actualizado', alias: config.alias });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  res.status(405).json({ message: 'Método no permitido' });
};
