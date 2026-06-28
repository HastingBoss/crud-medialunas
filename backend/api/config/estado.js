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
  return parseInt(new Date().toLocaleString('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: 'numeric',
    hour12: false
  }));
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('sv-SE');
}

module.exports = async (req, res) => {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const config = await prisma.config.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, horarioCierre: '00:00', forzadoCerrado: false, radioKm: 1 }
    });

    const hoy = getArgentinaDate();
    const horarioEfectivo = (config.horarioCierreFecha === hoy) ? config.horarioCierre : '00:00';
    const hora = getArgentinaHour();
    const [closeHour] = horarioEfectivo.split(':').map(Number);

    // Cierre por fecha (imprevisto del repartidor)
    let formularioAbierto = true;
    if (config.cierreHasta && config.cierreHasta >= hoy) {
      formularioAbierto = false;
    }

    let diaBase;
    if (closeHour >= 0 && closeHour <= 4) {
      diaBase = hora < closeHour ? hoy : addDays(hoy, 1);
    } else if (closeHour >= 20 && closeHour <= 23) {
      diaBase = hora >= closeHour ? addDays(hoy, 1) : hoy;
    } else {
      diaBase = hora < closeHour ? hoy : addDays(hoy, 1);
    }

    function siguienteDiaHabil(fechaStr) {
      let d = new Date(fechaStr + 'T00:00:00');
      while (d.getDay() === 0 || d.getDay() === 6) {
        d.setDate(d.getDate() + 1);
      }
      return d.toLocaleDateString('sv-SE');
    }

    const fechaMinima = siguienteDiaHabil(diaBase);

    res.json({
      formularioAbierto,
      horarioCierre: horarioEfectivo,
      cierreHasta: config.cierreHasta || null,
      fechaMinima,
      radioKm: config.radioKm ?? 1,
      alias: config.alias || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
