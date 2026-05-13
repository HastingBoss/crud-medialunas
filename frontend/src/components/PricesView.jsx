import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PACKS = [
  { key: 'individual', label: 'Pack Individual', emoji: '🥐' },
  { key: 'media',      label: 'Pack Media Docena', emoji: '🥐🥐' },
  { key: 'clasico',    label: 'Pack Clásico', emoji: '🥐🥐🥐' },
  { key: 'familiar',   label: 'Pack Familiar', emoji: '🥐🥐🥐🥐' },
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function PricesView() {
  const [prices, setPrices] = useState({ individual: 2200, media: 3800, clasico: 5500, familiar: 8000 });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/prices`);
        setPrices(res.data);
      } catch (err) {
        console.error('Error fetching prices:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, []);

  const handleChange = (key, value) => {
    setSaved(false);
    setError('');
    setPrices(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const parsed = {};
    for (const { key } of PACKS) {
      const val = parseInt(prices[key], 10);
      if (isNaN(val) || val <= 0) {
        setError(`El precio de "${PACKS.find(p => p.key === key).label}" debe ser un número positivo.`);
        return;
      }
      parsed[key] = val;
    }

    try {
      await axios.put(`${API_URL}/api/prices`, parsed);
      setPrices(parsed);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Error al guardar los precios en el servidor.');
      console.error(err);
    }
  };

  const handleReset = async () => {
    const defaultPrices = { individual: 2200, media: 3800, clasico: 5500, familiar: 8000 };
    try {
      await axios.put(`${API_URL}/api/prices`, defaultPrices);
      setPrices(defaultPrices);
      setSaved(true);
      setError('');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Error al restablecer los precios.');
    }
  };

  if (loading) return <div style={{ padding: '20px', color: 'var(--muted)' }}>Cargando precios...</div>;

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif', width: '100%' }}>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brown)', borderBottom: '2px solid #C4922A', paddingBottom: '6px', marginBottom: '6px' }}>
          💰 Gestión de precios
        </div>
        <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
          Los precios se guardan localmente en este dispositivo. Recargá la página del formulario para que los cambios tengan efecto.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {PACKS.map(({ key, label, emoji }) => (
          <div key={key} style={{ background: '#fff', borderRadius: '12px', padding: '14px 16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--brown)' }}>{emoji} {label}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '15px', color: '#888', fontWeight: 500 }}>$</span>
              <input
                type="number"
                min="1"
                value={prices[key]}
                onChange={e => handleChange(key, e.target.value)}
                style={{
                  width: '100px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border)',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--brown)',
                  fontFamily: 'inherit',
                  outline: 'none',
                  textAlign: 'right',
                }}
                onFocus={e => e.target.style.borderColor = '#C4922A'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ color: '#B71C1C', fontSize: '13px', marginBottom: '12px', padding: '10px', background: '#FFF0F0', borderRadius: '8px', border: '1px solid #FFCDD2' }}>
          ⚠️ {error}
        </div>
      )}

      {saved && (
        <div style={{ color: '#2E7D32', fontSize: '13px', marginBottom: '12px', padding: '10px', background: '#e8f5e9', borderRadius: '8px', border: '1px solid #c8e6c9', fontWeight: 600 }}>
          ✓ Precios guardados correctamente
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleSave}
          style={{ flex: 1, background: 'var(--brown)', color: '#fff', border: 'none', padding: '13px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.2s' }}
          onMouseEnter={e => e.target.style.opacity = '0.85'}
          onMouseLeave={e => e.target.style.opacity = '1'}
        >
          Guardar precios
        </button>
        <button
          onClick={handleReset}
          style={{ background: '#fff', color: 'var(--muted)', border: '1px solid var(--border)', padding: '13px 16px', borderRadius: '10px', fontWeight: 500, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
          title="Restaurar precios originales"
        >
          Restablecer
        </button>
      </div>
    </div>
  );
}
