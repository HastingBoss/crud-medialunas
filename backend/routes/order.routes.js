const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const orderController = require('../controllers/order.controller');

// Configuración de multer para subir comprobantes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('comprobante'), orderController.createOrder);
router.get('/', orderController.getOrders);
router.put('/:id/status', orderController.updateOrderStatus);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
