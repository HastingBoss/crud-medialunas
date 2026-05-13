let stock = 0;
let threshold = 10;

exports.getStock = (req, res) => {
  res.json({ stock, threshold });
};

exports.updateStock = (req, res) => {
  const { value, threshold: newThreshold } = req.body;
  if (typeof value === 'number') stock = value;
  if (typeof newThreshold === 'number') threshold = newThreshold;
  
  res.json({ message: 'Stock actualizado', stock, threshold });
};
