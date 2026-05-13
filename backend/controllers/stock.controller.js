let stock = 0;

exports.getStock = (req, res) => {
  res.json({ stock });
};

exports.updateStock = (req, res) => {
  const { value } = req.body;
  if (typeof value === 'number') {
    stock = value;
    res.json({ message: 'Stock actualizado', stock });
  } else {
    res.status(400).json({ message: 'Valor de stock inválido' });
  }
};
