import { useState, useEffect } from 'react';
import axios from 'axios';
import './ConfigView.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const PACKS = [
  { key: 'individual', label: 'Pack Individual', emoji: '🥐' },
  { key: 'media', label: 'Pack Media Docena', emoji: '🥐🥐' },
  { key: 'clasico', label: 'Pack Clásico', emoji: '🥐🥐🥐' },
  { key: 'familiar', label: 'Pack Familiar', emoji: '🥐🥐🥐🥐' },
];

export default function ConfigView({ config, onExtendTime, onCierreHasta, onLevantarCierre }) {
  const [horarioCierre, setHorarioCierre] = useState(config.horarioCierre || '05:00');
  const [radioKm, setRadioKm] = useState(config.radioKm ?? 1);
  const [radioSaved, setRadioSaved] = useState(false);
  const [horarioSaved, setHorarioSaved] = useState(false);
  const [cierreHastaInput, setCierreHastaInput] = useState('');
  const [prices, setPrices] = useState({ individual: 2200, media: 3800, clasico: 5500, familiar: 8000 });
  const [pricesSaved, setPricesSaved] = useState(false);
  const [pricesError, setPricesError] = useState('');

  useEffect(() => {
    setHorarioCierre(config.horarioCierre || '05:00');
    setRadioKm(config.radioKm ?? 1);
  }, [config]);

  useEffect(() => {
    axios.get(`${API_URL}/api/prices`).then(res => setPrices(res.data)).catch(console.error);
  }, []);

  const handleSaveHorario = async () => {
    try {
      await axios.put(`${API_URL}/api/config/extender`, { horarioCierre });
      setHorarioSaved(true);
      onExtendTime && onExtendTime();
      setTimeout(() => setHorarioSaved(false), 3000);
    } catch (err) { console.error(err); }
  };

  const handleSaveRadio = async () => {
    try {
      await axios.put(`${API_URL}/api/config/radio`, { radioKm });
      setRadioSaved(true);
      setTimeout(() => setRadioSaved(false), 3000);
    } catch (err) { console.error(err); }
  };

  const handleCierreHasta = async () => {
    if (!cierreHastaInput) return;
    try {
      await axios.post(`${API_URL}/api/config/extender`, { cierreHasta: cierreHastaInput });
      onCierreHasta && onCierreHasta();
      setCierreHastaInput('');
    } catch (err) { console.error(err); }
  };

  const handleSavePrices = async () => {
    const parsed = {};
    for (const { key, label } of PACKS) {
      const val = parseInt(prices[key], 10);
      if (isNaN(val) || val <= 0) {
        setPricesError(`El precio de "${label}" debe ser un número positivo.`);
        return;
      }
      parsed[key] = val;
    }
    try {
      await axios.put(`${API_URL}/api/prices`, parsed);
      setPrices(parsed);
      setPricesSaved(true);
      setPricesError('');
      setTimeout(() => setPricesSaved(false), 3000);
    } catch { setPricesError('Error al guardar los precios.'); }
  };

  const handleResetPrices = async () => {
    const defaults = { individual: 2200, media: 3800, clasico: 5500, familiar: 8000 };
    try {
      await axios.put(`${API_URL}/api/prices`, defaults);
      setPrices(defaults);
      setPricesSaved(true);
      setPricesError('');
      setTimeout(() => setPricesSaved(false), 3000);
    } catch { setPricesError('Error al restablecer los precios.'); }
  };

  return (
    <div className="config-view">

      <div className="config-group">
        <div className="config-group-header">
          <span className="config-group-icon">⏰</span>
          <div>
            <div className="config-group-title">Horario de corte</div>
            <div className="config-group-desc">Los pedidos se cierran automáticamente a esta hora.</div>
          </div>
        </div>
        <div className="config-row">
          <select className="config-select" value={horarioCierre} onChange={e => setHorarioCierre(e.target.value)}>
            {['03:00','04:00','05:00','06:00','07:00','07:30','08:00'].map(h => (
              <option key={h} value={h}>{h} hs</option>
            ))}
          </select>
          <button className="btn-config-save" onClick={handleSaveHorario}>Guardar</button>
          {horarioSaved && <span className="config-saved-msg">✓ Guardado</span>}
        </div>
      </div>

      <div className="config-divider" />

      <div className="config-group">
        <div className="config-group-header">
          <span className="config-group-icon">📋</span>
          <div>
            <div className="config-group-title">Cierre por fecha</div>
            <div className="config-group-desc">Cerrá los pedidos hasta una fecha específica — imprevistos, vacaciones.</div>
          </div>
        </div>
        {config.cierreHasta && (
          <div className="config-alert">
            <span>⚠️ Cerrado hasta <strong>{config.cierreHasta}</strong></span>
            <button className="btn-config-lift" onClick={() => { axios.delete(`${API_URL}/api/config/extender`); onLevantarCierre && onLevantarCierre(); }}>
              Levantar cierre
            </button>
          </div>
        )}
        <div className="config-row">
          <input type="date" className="config-input-date" value={cierreHastaInput} onChange={e => setCierreHastaInput(e.target.value)} min={new Date().toLocaleDateString('sv-SE')} />
          <button className="btn-config-save" onClick={handleCierreHasta}>Aplicar</button>
        </div>
      </div>

      <div className="config-divider" />

      <div className="config-group">
        <div className="config-group-header">
          <span className="config-group-icon">📍</span>
          <div>
            <div className="config-group-title">Radio de entrega</div>
            <div className="config-group-desc">Distancia máxima desde Albarracín 1241, Temperley.</div>
          </div>
        </div>
        <div className="config-row">
          <input type="number" className="config-input-number" min="0.5" max="10" step="0.5" value={radioKm} onChange={e => setRadioKm(parseFloat(e.target.value))} />
          <span className="config-unit">km</span>
          <button className="btn-config-save" onClick={handleSaveRadio}>Guardar</button>
          {radioSaved && <span className="config-saved-msg">✓ Guardado</span>}
        </div>
      </div>

      <div className="config-divider" />

      <div className="config-group">
        <div className="config-group-header">
          <span className="config-group-icon">💰</span>
          <div>
            <div className="config-group-title">Precios de packs</div>
            <div className="config-group-desc">Los cambios se aplican automáticamente al formulario de pedidos.</div>
          </div>
        </div>
        <div className="prices-list">
          {PACKS.map(({ key, label, emoji }) => (
            <div key={key} className="price-item-card">
              <div className="price-item-label">{emoji} {label}</div>
              <div className="price-input-group">
                <span className="price-currency">$</span>
                <input type="number" className="price-input" min="1" value={prices[key]} onChange={e => setPrices(prev => ({ ...prev, [key]: e.target.value }))} />
              </div>
            </div>
          ))}
        </div>
        {pricesError && <div className="price-error-msg">⚠️ {pricesError}</div>}
        {pricesSaved && <div className="price-success-msg">✓ Precios guardados correctamente</div>}
        <div className="prices-actions">
          <button className="btn-prices-save" onClick={handleSavePrices}>Guardar precios</button>
          <button className="btn-prices-reset" onClick={handleResetPrices}>Restablecer</button>
        </div>
      </div>

    </div>
  );
}
