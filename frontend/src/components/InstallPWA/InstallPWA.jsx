import React, { useState, useEffect } from 'react';
import './InstallPWA.css';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Evitar que el banner automático del navegador se muestre
      e.preventDefault();
      // Guardar el evento para dispararlo manualmente luego
      setDeferredPrompt(e);
      // Hacer visible el banner de instalación
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Ocultar si ya está en modo standalone (instalada)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Mostrar el prompt nativo
    deferredPrompt.prompt();

    // Esperar la decisión del usuario
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`El usuario respondió a la propuesta de instalación: ${outcome}`);

    // Limpiar el estado
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="install-pwa-banner">
      <div className="install-pwa-content">
        <div className="install-pwa-icon">🥐</div>
        <div className="install-pwa-text">
          <h3>¡Instalá la App!</h3>
          <p>Gestioná tus pedidos y repartos rápido desde tu pantalla de inicio.</p>
        </div>
      </div>
      <button className="install-pwa-button" onClick={handleInstallClick}>
        Instalar
      </button>
    </div>
  );
}
