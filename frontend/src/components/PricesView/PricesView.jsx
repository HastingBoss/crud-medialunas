import { useState, useEffect } from 'react';
import axios from 'axios';
import './PricesView.css';

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

  useEffect(() => {
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
    } catch {
      setError('Error al restablecer los precios.');
    }
  };

  if (loading) return <div className="prices-view-container" style={{ padding: '20px', color: 'var(--muted)' }}>Cargando precios...</div>;

  return (
    <div className="prices-view-container">
      <div className="prices-header">
        <div className="prices-title">💰 Gestión de precios</div>
        <p className="prices-subtitle">
          Los precios se guardan en la base de datos y se aplican automáticamente al formulario.
        </p>
      </div>

      <div className="prices-list">
        {PACKS.map(({ key, label, emoji }) => (
          <div key={key} className="price-item-card">
            <div className="price-item-label">{emoji} {label}</div>
            <div className="price-input-group">
              <span className="price-currency">$</span>
              <input
                type="number"
                className="price-input"
                min="1"
                value={prices[key]}
                onChange={e => handleChange(key, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="price-error-msg">⚠️ {error}</div>
      )}

      {saved && (
        <div className="price-success-msg">✓ Precios guardados correctamente</div>
      )}

      <div className="prices-actions">
        <button className="btn-prices-save" onClick={handleSave}>
          Guardar precios
        </button>
        <button
          className="btn-prices-reset"
          onClick={handleReset}
          title="Restaurar precios originales"
        >
          Restablecer
        </button>
      </div>
    </div>
  );
}
