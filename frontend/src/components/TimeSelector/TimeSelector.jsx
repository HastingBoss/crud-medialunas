import React from 'react';
import './TimeSelector.css';

const RANGES = [
  { label: '8:00 - 8:30', desde: '08:00', hasta: '08:30' },
  { label: '8:30 - 9:00', desde: '08:30', hasta: '09:00' },
  { label: '9:00 - 9:30', desde: '09:00', hasta: '09:30' },
  { label: '9:30 - 10:00', desde: '09:30', hasta: '10:00' }
];

export default function TimeSelector({ desde, hasta, handleInputChange, horarioCompleto }) {
  const currentValue = desde && hasta ? `${desde}-${hasta}` : '';

  const handleChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [d, h] = val.split('-');
    handleInputChange('desde', d);
    handleInputChange('hasta', h);
  };

  return (
    <div className="time-selector-container">
      <p className="section-title">Horario de entrega{horarioCompleto && <span className="check-mark">✓</span>}</p>
      <div className="field">
        <label className="field-label">¿En qué horario preferís recibir?</label>
        <select value={currentValue} onChange={handleChange} style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', border: '1.5px solid var(--border)' }}>
          <option value="" disabled hidden>Seleccioná un horario...</option>
          {RANGES.map(r => (
            <option key={r.label} value={`${r.desde}-${r.hasta}`}>{r.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
