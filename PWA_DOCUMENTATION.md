# 📱 Progressive Web App (PWA) - CRUD Medialunas

Este documento detalla la integración de Progressive Web App (PWA) en la aplicación para permitir a repartidores y clientes instalar la app directamente en su pantalla de inicio en Android o Chrome sin acceder a los ajustes del navegador.

---

## 🏗️ Componentes de la PWA

La implementación consta de los siguientes archivos y configuraciones:

### 1. Manifiesto de Aplicación (`frontend/public/manifest.json`)
Define el comportamiento e identidad visual de la aplicación cuando se instala:
- **`display: "standalone"`**: Elimina la barra de navegación del navegador para simular una app nativa.
- **`orientation: "portrait"`**: Fuerza la orientación vertical.
- **Iconos**: Se incluyeron recursos gráficos estándar de `192x192` y `512x512` píxeles.
- **`theme_color` / `background_color`**: Mantiene el color temático `#2E7D32` (verde marca).

### 2. Service Worker (`frontend/public/sw.js`)
Permite el funcionamiento offline básico y cumple con el requisito de instalación de Chrome:
- **Instalación**: Almacena en caché la shell de la aplicación (`index.html`, `manifest.json`, `favicon.svg`).
- **Activación**: Limpia versiones previas de la caché.
- **Fetch**: Estrategia de Cache First (sirve desde caché si existe) con fallback de red para recursos GET del mismo origen, y fallback offline de contingencia para el documento HTML.

### 3. Registro del Service Worker (`frontend/src/main.jsx`)
Registra el service worker una vez cargada la ventana (`window.onload`) para optimizar el rendimiento inicial.

### 4. Componente de Instalación (`frontend/src/components/InstallPWA/`)
- **`InstallPWA.jsx`**: Escucha de manera limpia el evento `beforeinstallprompt`, previene el banner por defecto del navegador, expone el botón de instalación si la app es instalable, ejecuta el prompt nativo tras interacción del usuario y limpia el estado.
- **`InstallPWA.css`**: Banner flotante premium con desenfoque de fondo (glassmorphism), centrado en la parte inferior de la pantalla.

---

## 🧪 Pruebas Locales y Verificación

1. **Requisitos de PWA**: Chrome requiere HTTPS o un origen `localhost`/`127.0.0.1` para habilitar el banner de instalación.
2. **Inspección en Chrome DevTools**:
   - Abrir DevTools (`F12`).
   - Ir a la pestaña **Application**.
   - Seleccionar **Manifest** para verificar que se cargue correctamente el nombre, colores e iconos.
   - Seleccionar **Service Workers** para corroborar que esté activo y corriendo.
3. **Simular Instalación**:
   - Si la app es instalable, se mostrará el banner flotante en la parte inferior con la opción "Instalar".
   - Al hacer clic, se lanzará el diálogo nativo de Chrome.
