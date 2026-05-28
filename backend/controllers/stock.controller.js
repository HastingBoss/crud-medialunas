const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getStock = async (req, res) => {
  try {
    const stock = await prisma.stock.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, stock: 0, threshold: 10 }
    });
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { value, threshold } = req.body;
    const data = {};
    if (typeof value === 'number') data.stock = value;
    if (typeof threshold === 'number') data.threshold = threshold;
    const stock = await prisma.stock.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, stock: value ?? 0, threshold: threshold ?? 10 }
    });
    res.json({ message: 'Stock actualizado', ...stock });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
