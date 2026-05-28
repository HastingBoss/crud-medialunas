const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULTS = { individual: 2200, media: 3800, clasico: 6800, familiar: 12500 };

exports.getPrices = async (req, res) => {
  try {
    const prices = await prisma.precios.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, ...DEFAULTS }
    });
    res.json(prices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePrices = async (req, res) => {
  try {
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
    res.json({ message: 'Precios actualizados exitosamente', prices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
