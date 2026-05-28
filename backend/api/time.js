module.exports = (req, res) => {
  const now = new Date();
  const hora = parseInt(new Date().toLocaleString('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: 'numeric',
    hour12: false
  }));
  res.json({
    utc: now.toISOString(),
    argentina: now.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }),
    hora
  });
};
