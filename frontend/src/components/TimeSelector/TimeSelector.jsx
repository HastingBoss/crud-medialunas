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
    <div className="time-selector-container" style={{ marginTop: '22px' }}>
      <p className="section-title">Horario de entrega{horarioCompleto && <span style={{ color: '#2E7D32', marginLeft: '8px', fontSize: '18px' }}>✓</span>}</p>
      <div className="field">
        <label className="field-label">¿En qué horario preferís recibir?</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginTop: '10px' }}>
          {RANGES.map(r => {
            const isSelected = currentValue === `${r.desde}-${r.hasta}`;
            return (
              <button
                key={r.label}
                type="button"
                onClick={() => {
                  handleInputChange('desde', r.desde);
                  handleInputChange('hasta', r.hasta);
                }}
                style={{
                  padding: '14px 10px',
                  borderRadius: '12px',
                  border: `1.5px solid ${isSelected ? 'var(--brand-green)' : 'var(--border)'}`,
                  background: isSelected ? '#eaf1ec' : '#fff',
                  color: isSelected ? 'var(--brand-green)' : 'var(--text)',
                  fontWeight: isSelected ? '600' : '500',
                  fontSize: '15px',
                  fontFamily: '"DM Sans", sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                  boxShadow: isSelected ? '0 2px 8px rgba(36, 110, 58, 0.1)' : 'none'
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
