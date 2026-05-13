// In-memory price store
let prices = {
  individual: 2200,
  media: 3800,
  clasico: 6800,
  familiar: 12500
};

exports.getPrices = (req, res) => {
  res.json(prices);
};

exports.updatePrices = (req, res) => {
  const newPrices = req.body;
  
  // Validar que todos los campos necesarios estén presentes y sean números
  const keys = ['individual', 'media', 'clasico', 'familiar'];
  for (const key of keys) {
    if (newPrices[key] === undefined || isNaN(Number(newPrices[key]))) {
      return res.status(400).json({ message: `Precio para ${key} es inválido o falta` });
    }
  }

  prices = {
    individual: Number(newPrices.individual),
    media: Number(newPrices.media),
    clasico: Number(newPrices.clasico),
    familiar: Number(newPrices.familiar)
  };

  res.json({ message: 'Precios actualizados exitosamente', prices });
};
