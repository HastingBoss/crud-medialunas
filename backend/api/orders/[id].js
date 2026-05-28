const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

module.exports = async (req, res) => {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  if (req.method === 'PUT') {
    const updatedOrder = await prisma.pedido.update({
      where: { id },
      data: req.body
    });
    return res.json({ message: 'Pedido actualizado', order: updatedOrder });
  }

  if (req.method === 'DELETE') {
    await prisma.pedido.delete({ where: { id } });
    return res.json({ message: 'Pedido eliminado' });
  }

  res.status(405).json({ message: 'Método no permitido' });
};
