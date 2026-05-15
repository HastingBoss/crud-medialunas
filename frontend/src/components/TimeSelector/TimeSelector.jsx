import React from 'react';
import './TimeSelector.css';

const HOURS = ['08:00', '08:30', '09:00', '09:30', '10:00'];

export default function TimeSelector({ desde, hasta, handleInputChange, horarioCompleto }) {
  return (
    <div className="time-selector-container">
      <p className="section-title">Horario de entrega{horarioCompleto && <span className="check-mark">✓</span>}</p>
      <div className="field">
        <label className="field-label">¿A partir de qué hora podés recibir?</label>
        <div className="time-row">
          <div>
            <label className="field-label">Desde</label>
            <select value={desde} onChange={e => handleInputChange('desde', e.target.value)}>
              <option value="" disabled hidden>Hora...</option>
              {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div className="time-sep">—</div>
          <div>
            <label className="field-label">Hasta</label>
            <select value={hasta} onChange={e => handleInputChange('hasta', e.target.value)}>
              <option value="" disabled hidden>Hora...</option>
              {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
