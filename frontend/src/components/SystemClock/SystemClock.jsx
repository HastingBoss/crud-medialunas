import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SystemClock.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function SystemClock() {
  const [serverTime, setServerTime] = useState(null);
  const [userTime, setUserTime] = useState(new Date());

  const fetchServerTime = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/time`);
      setServerTime(new Date(res.serverTime));
    } catch (err) {
      console.error('Error fetching server time:', err);
    }
  };

  useEffect(() => {
    fetchServerTime();
    const interval = setInterval(() => {
      setUserTime(new Date());
      // Incrementamos el tiempo del servidor localmente para que sea fluido
      setServerTime(prev => prev ? new Date(prev.getTime() + 1000) : null);
    }, 1000);

    // Re-sincronizamos con el servidor cada 30 segundos
    const syncInterval = setInterval(fetchServerTime, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(syncInterval);
    };
  }, []);

  const formatTime = (date) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date) => {
    if (!date) return '----/--/--';
    return date.toLocaleDateString('sv-SE');
  };

  return (
    <div className="system-clocks-container">
      <div className="clock-item">
        <span className="clock-label">Servidor (Corte):</span>
        <span className="clock-value">{formatDate(serverTime)} {formatTime(serverTime)}</span>
      </div>
      <div className="clock-item">
        <span className="clock-label">Tu dispositivo:</span>
        <span className="clock-value">{formatDate(userTime)} {formatTime(userTime)}</span>
      </div>
    </div>
  );
}
