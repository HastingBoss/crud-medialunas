const nodemailer = require('nodemailer');

// Configuración del transporter (ajustar con credenciales reales)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

exports.sendOrderEmail = async (order) => {
  try {
    const info = await transporter.sendMail({
      from: '"Medialunas Artesanales" <no-reply@medialunas.com>',
      to: process.env.ADMIN_EMAIL || 'admin@medialunas.com', // Notifica al admin, o al cliente si order.email existe
      subject: `Nuevo pedido de ${order.nombre}`,
      text: `Detalle del pedido:
        Nombre: ${order.nombre}
        Teléfono: ${order.telefono}
        Paquete: ${order.paquete} unidades
        Pago: ${order.pago}
        ${order.comprobante ? `Comprobante: ${order.comprobante}` : ''}`,
      html: `
        <h3>Nuevo pedido</h3>
        <p><strong>Nombre:</strong> ${order.nombre}</p>
        <p><strong>Teléfono:</strong> ${order.telefono}</p>
        <p><strong>Paquete:</strong> ${order.paquete} unidades</p>
        <p><strong>Método de pago:</strong> ${order.pago}</p>
        ${order.comprobante ? `<p><strong>Comprobante:</strong> <a href="${process.env.BASE_URL}/uploads/${order.comprobante}">Ver comprobante</a></p>` : ''}
      `
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error enviando email:", error);
  }
};
