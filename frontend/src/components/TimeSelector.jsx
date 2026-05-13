import React from 'react';

const HOURS = ['08:00', '08:30', '09:00', '09:30', '10:00'];

export default function TimeSelector({ desde, hasta, handleInputChange, horarioCompleto }) {
  const CheckMark = () => <span style={{ color: '#2E7D32', marginLeft: '8px', fontSize: '18px' }}>✓</span>;

  return (
    <>
      <p className="section-title" style={{ marginTop: '22px' }}>Horario de entrega{horarioCompleto && <CheckMark />}</p>
      <div className="field">
        <label className="field-label">¿A partir de qué hora podés recibir?</label>
        <div className="horario-row">
          <div>
            <label className="field-label">Desde</label>
            <select value={desde} onChange={e => handleInputChange('desde', e.target.value)}>
              <option value="" disabled hidden>Hora...</option>
              {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div className="horario-sep">—</div>
          <div>
            <label className="field-label">Hasta</label>
            <select value={hasta} onChange={e => handleInputChange('hasta', e.target.value)}>
              <option value="" disabled hidden>Hora...</option>
              {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>
      </div>
    </>
  );
}
