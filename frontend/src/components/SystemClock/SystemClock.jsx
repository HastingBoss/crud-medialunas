import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SystemClock.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function SystemClock() {
  const [userTime, setUserTime] = useState(new Date());
  const [horarioCierre, setHorarioCierre] = useState(null);
  const [cierreHasta, setCierreHasta] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/config/estado`);
        setHorarioCierre(res.data.horarioCierre);
        setCierreHasta(res.data.cierreHasta);
      } catch (err) {
        console.error('Error fetching config:', err);
      }
    };
    fetchConfig();
    const interval = setInterval(() => setUserTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date) => date.toLocaleDateString('sv-SE');

  return (
    <div className="system-clocks-container">
      <div className="clock-item">
        <span className="clock-label">Corte de pedidos:</span>
        <span className="clock-value">{horarioCierre ?? '--:--'}</span>
      </div>
      {cierreHasta && (
        <div className="clock-item">
          <span className="clock-label">Cerrado hasta:</span>
          <span className="clock-value">{cierreHasta}</span>
        </div>
      )}
      <div className="clock-item">
        <span className="clock-label">Tu dispositivo:</span>
        <span className="clock-value">{formatDate(userTime)} {formatTime(userTime)}</span>
      </div>
    </div>
  );
}
