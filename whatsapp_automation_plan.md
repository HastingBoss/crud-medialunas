# Plan de Integración Profunda con WhatsApp (Automatización)

Este documento detalla las opciones y la arquitectura necesaria para automatizar el flujo de comunicación por WhatsApp, desde la recepción del primer mensaje hasta la notificación de entrega.

## 1. Opciones de Implementación

Para lograr automatización real (mensajes que se envían solos sin que un humano toque el teléfono), existen tres caminos principales:

### Opción A: API Oficial de WhatsApp (Cloud API) - **RECOMENDADO PARA ESCALABILIDAD**
Es la opción oficial de Meta.
- **Pros**: 100% estable, sin riesgo de baneo, permite cuentas verificadas.
- **Contras**: Requiere aprobación de "Plantillas de Mensajes", costo por conversación (aunque las primeras 1000/mes suelen ser gratis).
- **Herramienta**: [Twilio](https://www.twilio.com/whatsapp) o directamente [Meta for Developers](https://developers.facebook.com/docs/whatsapp/cloud-api).

### Opción B: Librerías de Automatización (WhatsApp-web.js) - **ECONÓMICO**
Utiliza un navegador "invisible" para manejar una cuenta de WhatsApp Web.
- **Pros**: Gratis (open source), permite enviar cualquier texto sin aprobación previa.
- **Contras**: Riesgo alto de baneo si se envían muchos mensajes seguidos, requiere mantener un servidor encendido con la sesión activa.
- **Herramienta**: [whatsapp-web.js](https://wwebjs.dev/) o [Venom-bot](https://github.com/orkestral/venom).

### Opción C: Servicios de Terceros (2Chat / Wati) - **MÁS RÁPIDO**
Plataformas intermediarias que exponen una API sencilla.
- **Pros**: Muy fácil de integrar, dashboard propio para ver mensajes.
- **Contras**: Costo mensual fijo (aprox. $15 - $50 USD).

---

## 2. Flujo Lógico de Mensajería

### Fase 1: Bienvenida y Captura (Puntos 1, 2 y 3)
- **Activador**: El usuario envía cualquier mensaje.
- **Acción**: El Bot responde inmediatamente con el mensaje de bienvenida y el link al `UserForm`.
- **Implementación**: Un Webhook en el backend escuchando mensajes entrantes.

### Fase 2: Confirmación Automática (Puntos 4 y 5)
- **Activador**: El `UserForm` se envía exitosamente (POST `/api/orders`).
- **Acción**: El servidor, al guardar el pedido, dispara un mensaje de WhatsApp al número del cliente.
- **Contenido**: Resumen dinámico (Pack, Total, Dirección, Horario).

### Fase 3: Soporte (Punto 6)
- **Activador**: El usuario responde al mensaje de confirmación.
- **Acción**: El Bot detecta que no es un comando de pedido y envía la respuesta de "Responderemos a la brevedad".

### Fase 4: Notificaciones de Reparto (Puntos 7 y 8)
- **Activador**: El administrador hace clic en un nuevo botón "Notificar Salida" en la barra de ruta optimizada.
- **Acción**: El sistema envía un mensaje masivo individualizado a todos los clientes seleccionados en ese tramo: *"¡Hola! El repartidor ya salió con tu pedido..."*

---

## 3. Hoja de Ruta Sugerida

1.  **Backend**: Crear un nuevo controlador `whatsapp.controller.js` para centralizar la lógica de envío.
2.  **Infraestructura**: Decidir si usar la **API Oficial** (Twilio) o una **Librería** (whatsapp-web.js). 
    > *Nota: Para un negocio artesanal, `whatsapp-web.js` suele ser suficiente si el volumen no supera los 100 mensajes diarios.*
3.  **Base de Datos**: Es fundamental migrar a **MongoDB** (lo que tenemos pendiente) para que el Bot pueda consultar estados de pedidos y de stock en tiempo real.
4.  **Webhooks**: Configurar un túnel (como Ngrok o despliegue en la nube) para que WhatsApp pueda avisarle a nuestro backend cuando llega un mensaje nuevo.

## 4. Ejemplo de Código (Conceptual con Twilio)

```javascript
// Al confirmar pedido
async function sendConfirmation(order) {
  await twilio.messages.create({
    body: `¡Hola ${order.nombre}! 🥐 Confirmamos tu pedido: \n${order.paquete}\nTotal: $${order.total}\nTe lo llevamos mañana a las ${order.desde} hs.`,
    from: 'whatsapp:+123456789',
    to: `whatsapp:${order.telefono}`
  });
}
```

---

## 5. Estimación de Volumen y Costos

Para tomar una decisión rentable, debemos considerar que la **API Oficial** cobra por **"Conversación"** (una ventana de 24 horas), mientras que las otras suelen cobrar por mensaje o abono fijo.

### Promedio de Mensajes por Cliente (Pedido único)
1. **Inicio**: Hola, quiero pedir (1 msj).
2. **Bot**: Bienvenida + Link (1 msj).
3. **Bot**: Confirmación de pedido (1 msj).
4. **Soporte/Dudas**: Promedio de 2 idas y vueltas (4 msjs).
5. **Bot**: Notificación de reparto (1 msj).
6. **Bot**: Confirmación de entrega (1 msj).
**Total estimado: 9 mensajes por pedido.**

### Escenarios de Volumen

| Pedidos / Día | Mensajes / Mes | Costo API Oficial (Twilio/Meta) | Riesgo Baneo (Unofficial) |
| :--- | :--- | :--- | :--- |
| **5 (Bajo)** | ~1,350 | **$0** (Meta suele dar 1000 gratis) | Nulo |
| **20 (Medio)** | ~5,400 | **~$30 - $50 USD / mes** | Medio (requiere pausas) |
| **50 (Alto)** | ~13,500 | **~$80 - $120 USD / mes** | Alto (no recomendado) |

> [!TIP]
> **Recomendación para el cliente**: Empezar con la **Opción B (whatsapp-web.js)** para validar el flujo sin costos fijos. Si el volumen supera los 15-20 pedidos diarios, migrar a la **API Oficial** para asegurar que el número no sea bloqueado y profesionalizar la marca.
