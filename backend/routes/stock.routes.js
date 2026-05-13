const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stock.controller');

router.get('/', stockController.getStock);
router.put('/', stockController.updateStock);

module.exports = router;
