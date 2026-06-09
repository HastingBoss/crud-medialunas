import { useState, useRef, useEffect } from 'react';
import './TimeSelector.css';

const RANGES = [
  { label: '8:00 - 8:30', desde: '08:00', hasta: '08:30' },
  { label: '8:30 - 9:00', desde: '08:30', hasta: '09:00' },
  { label: '9:00 - 9:30', desde: '09:00', hasta: '09:30' },
  { label: '9:30 - 10:00', desde: '09:30', hasta: '10:00' }
];

export default function TimeSelector({ desde, hasta, handleInputChange, horarioCompleto }) {
  const currentValue = desde && hasta ? `${desde}-${hasta}` : '';
  const currentLabel = RANGES.find(r => `${r.desde}-${r.hasta}` === currentValue)?.label || 'Seleccioná un horario...';
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="time-selector-container" style={{ marginTop: '22px' }}>
      <p className="section-title">Horario de entrega{horarioCompleto && <span style={{ color: '#2E7D32', marginLeft: '8px', fontSize: '18px' }}>✓</span>}</p>
      <div className="field">
        <label className="field-label">¿En qué horario preferís recibir?</label>
        
        <div className="custom-dropdown" ref={dropdownRef} style={{ position: 'relative', marginTop: '10px' }}>
          <div 
            className="dropdown-header" 
            onClick={() => setIsOpen(!isOpen)}
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              border: `1.5px solid ${isOpen ? 'var(--brand-green)' : 'var(--border)'}`,
              background: '#fff',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: '"Nunito", sans-serif',
              fontSize: '16px',
              color: currentValue ? 'var(--text)' : 'var(--muted)',
              transition: 'all 0.2s ease',
              boxShadow: isOpen ? '0 0 0 3px rgba(36, 110, 58, 0.1)' : 'none'
            }}
          >
            <span>{currentLabel}</span>
            <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '12px' }}>▼</span>
          </div>

          {isOpen && (
            <div 
              className="dropdown-list" 
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '8px',
                background: '#fff',
                border: '1.5px solid var(--border)',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                zIndex: 10,
                overflow: 'hidden'
              }}
            >
              {RANGES.map((r, i) => {
                const isSelected = currentValue === `${r.desde}-${r.hasta}`;
                return (
                  <div
                    key={r.label}
                    onClick={() => {
                      handleInputChange('desde', r.desde);
                      handleInputChange('hasta', r.hasta);
                      setIsOpen(false);
                    }}
                    style={{
                      padding: '14px 16px',
                      cursor: 'pointer',
                      fontFamily: '"Nunito", sans-serif',
                      fontSize: '16px',
                      color: isSelected ? 'var(--brand-green)' : 'var(--text)',
                      background: isSelected ? '#eaf1ec' : '#fff',
                      borderBottom: i < RANGES.length - 1 ? '1px solid #f0f0f0' : 'none',
                      transition: 'background 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => { if(!isSelected) e.currentTarget.style.background = '#fdf8f5'; }}
                    onMouseLeave={(e) => { if(!isSelected) e.currentTarget.style.background = '#fff'; }}
                  >
                    {r.label}
                    {isSelected && <span>✓</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
