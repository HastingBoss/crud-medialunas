# 🥐 Medialunas App — Plataforma de Pedidos Online

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat-square&logo=postgresql)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel)
![Render](https://img.shields.io/badge/API-Render-46E3B7?style=flat-square&logo=render)

Plataforma web de pedidos para un emprendimiento de medialunas artesanales. Desarrollada como solución completa end-to-end para digitalizar y centralizar la gestión de pedidos, reemplazando flujos manuales por WhatsApp.

**Demo en vivo:** [crud-medialunas.vercel.app](https://crud-medialunas.vercel.app)

---

## ✨ Features

### Formulario del cliente (`/`)
- **PWA Integrada**: Instalable directamente en la pantalla de inicio del dispositivo (soporta offline y manifest completo).
- **Selección de packs**: Contadores interactivos, validaciones de disponibilidad de stock en tiempo real y resumen dinámico del pedido.
- **Selector de fecha**: Vista rápida tipo scroll horizontal de los próximos 7 días laborales y calendario extendido hasta 30 días.
- **Selector de franja horaria**: Selección del intervalo horario preferido por el cliente.
- **Geocodificación**: Búsqueda autocompletable y cálculo de coordenadas mediante **Nominatim (OpenStreetMap)** al salir del foco del input.
- **Flujo de pago**: Opción de Efectivo al recibir o Transferencia bancaria (con carga y envío de comprobante por WhatsApp).

### Panel de administración (`/admin`)
- **Autenticación segura**: Acceso restringido simple mediante clave.
- **Filtros avanzados**: Listado interactivo de pedidos con filtros instantáneos por fecha y estado de entrega.
- **Planificador de rutas**: Ruteador optimizado con cálculo de camino más corto (Vecino más Cercano) integrado con Google Maps.
- **Gestión de Stock y Precios**: Control centralizado del stock de unidades de medialunas, alertas de stock mínimo y cambio instantáneo de precios de los paquetes.
- **Horario de corte flexible**: Endpoints dedicados para automatizar la apertura (00:00) y el cierre de toma de pedidos diarios con posibilidad de extenderlo manualmente.
- **Métricas e Informes**: Reportes diarios y mensuales de recaudación, cantidades vendidas por pack y gráficos de barra de pedidos por día.

---

## 🛠 Stack tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 19, Vite, React Router 7, Leaflet, React Datepicker |
| **Backend** | Node.js, Express, Prisma ORM, Node-Cron, Multer |
| **Base de Datos** | PostgreSQL (Supabase / Neon) |
| **Geocodificación** | Nominatim API (OpenStreetMap) |
| **Mapas** | Leaflet + OpenStreetMap |
| **Notificaciones** | Nodemailer (Envío de correos de confirmación) |

---

## 🏗 Arquitectura del Proyecto

```
crud-medialunas/
├── frontend/                  # Aplicación de React (Vite)
│   ├── public/                # Recursos públicos (Service Worker, Manifest, Iconos)
│   └── src/
│       ├── components/        # Componentes modulares y reutilizables
│       ├── hooks/             # Custom hooks para aislar lógica de negocio (useOrders, useOrderForm)
│       ├── pages/             # Vistas principales (UserForm, AdminDashboard)
│       └── App.jsx            # Enrutamiento de la aplicación
└── backend/                   # API REST en Node.js + Express
    ├── api/                   # Handlers de Vercel (si se requiere serverless)
    ├── controllers/           # Controladores con lógica de negocio
    ├── prisma/                # Esquema de Prisma y cliente autogenerado
    ├── routes/                # Enrutadores Express expuestos en la API
    ├── services/              # Servicio de envío de emails
    └── server.js              # Punto de entrada de la API Express + tareas Cron
```

---

## 📡 API REST principal

### Configuración y Pedidos
| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/orders` | Obtener todos los pedidos |
| `POST` | `/api/orders` | Crear un nuevo pedido del cliente |
| `PUT` | `/api/orders/:id/status` | Actualizar estado, pago o reprogramación de un pedido |
| `DELETE` | `/api/orders/:id` | Eliminar pedido permanentemente |

### Precios y Stock
| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/prices` | Obtener precios vigentes de los packs |
| `PUT` | `/api/prices` | Modificar precios de los packs |
| `GET` | `/api/stock` | Consultar stock actual y umbral de alerta |
| `PUT` | `/api/stock` | Actualizar stock y umbral mínimo |
| `GET` | `/api/config/estado` | Ver estado y hora de cierre del formulario |
| `PUT` | `/api/config/extender` | Extender el horario de cierre de hoy |

---

## 🚀 Cómo empezar en local

### 1. Requisitos previos
- Tener instalado **Node.js** (v18+)
- Una base de datos **PostgreSQL** disponible

### 2. Configurar backend
1. Navega al directorio `/backend`.
2. Crea un archivo `.env` tomando como base `.env.example` y define `DATABASE_URL` y variables SMTP para el envío de mails.
3. Instala las dependencias y corre las migraciones de Prisma:
   ```bash
   npm install
   npx prisma db push
   ```
4. Levanta el servidor:
   ```bash
   npm start
   ```

### 3. Configurar frontend
1. Navega al directorio `/frontend`.
2. Crea un archivo `.env` definiendo `VITE_API_URL` apuntando a tu backend.
3. Instala dependencias y arranca el entorno de desarrollo:
   ```bash
   npm install
   npm run dev
   ```

---

## 👨‍💻 Autor

Desarrollado por **Luca Guerra** — GitHub: [HastingBoss](https://github.com/HastingBoss) LinkedIn: [Luca Guerra](https://www.linkedin.com/in/luca-guerra-webdev/)