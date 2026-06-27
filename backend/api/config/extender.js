const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PUT,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

module.exports = async (req, res) => {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // PUT — cambiar horario de cierre (extender o recortar)
    if (req.method === 'PUT') {
      const hoy = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' });
      const { horarioCierre } = req.body;
      if (!horarioCierre) return res.status(400).json({ message: 'Debe proveer horarioCierre (HH:MM)' });
      const config = await prisma.config.upsert({
        where: { id: 1 },
        update: { horarioCierre, horarioCierreFecha: hoy },
        create: { id: 1, horarioCierre, horarioCierreFecha: hoy, forzadoCerrado: false }
      });
      return res.json({ message: 'Horario de cierre actualizado', config });
    }

    // POST — cierre por fecha (imprevisto)
    if (req.method === 'POST') {
      const { cierreHasta } = req.body;
      if (!cierreHasta) return res.status(400).json({ message: 'Debe proveer cierreHasta (YYYY-MM-DD)' });
      const config = await prisma.config.upsert({
        where: { id: 1 },
        update: { cierreHasta },
        create: { id: 1, horarioCierre: '05:00', forzadoCerrado: false, cierreHasta }
      });
      return res.json({ message: 'Cierre por fecha configurado', config });
    }

    // DELETE — levantar cierre por fecha
    if (req.method === 'DELETE') {
      const config = await prisma.config.upsert({
        where: { id: 1 },
        update: { cierreHasta: null },
        create: { id: 1, horarioCierre: '05:00', forzadoCerrado: false }
      });
      return res.json({ message: 'Cierre por fecha levantado', config });
    }

    res.status(405).json({ message: 'Método no permitido' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
