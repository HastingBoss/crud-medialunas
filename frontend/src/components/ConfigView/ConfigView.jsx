import { useState, useEffect } from 'react';
import axios from 'axios';
import PricesView from '../PricesView/PricesView.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ConfigView({ config, onExtendTime, onCierreHasta, onLevantarCierre }) {
  const [horarioCierre, setHorarioCierre] = useState(config.horarioCierre || '05:00');
  const [radioKm, setRadioKm] = useState(config.radioKm ?? 1);
  const [radioSaved, setRadioSaved] = useState(false);
  const [horarioSaved, setHorarioSaved] = useState(false);
  const [cierreHastaInput, setCierreHastaInput] = useState('');

  useEffect(() => {
    setHorarioCierre(config.horarioCierre || '05:00');
    setRadioKm(config.radioKm ?? 1);
  }, [config]);

  const handleSaveHorario = async () => {
    try {
      await axios.put(`${API_URL}/api/config/extender`, { horarioCierre });
      setHorarioSaved(true);
      onExtendTime && onExtendTime();
      setTimeout(() => setHorarioSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveRadio = async () => {
    try {
      await axios.put(`${API_URL}/api/config/radio`, { radioKm });
      setRadioSaved(true);
      setTimeout(() => setRadioSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCierreHasta = async () => {
    if (!cierreHastaInput) return;
    try {
      await axios.post(`${API_URL}/api/config/extender`, { cierreHasta: cierreHastaInput });
      onCierreHasta && onCierreHasta();
      setCierreHastaInput('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Horario de corte */}
      <div className="config-section">
        <div className="config-section-title">⏰ Horario de corte de pedidos</div>
        <p className="config-section-desc">Los pedidos se cierran automáticamente a esta hora.</p>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
          <select
            value={horarioCierre}
            onChange={e => setHorarioCierre(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--border)', fontFamily: 'inherit', fontSize: '14px' }}
          >
            {['03:00','04:00','05:00','06:00','07:00','07:30','08:00'].map(h => (
              <option key={h} value={h}>{h} hs</option>
            ))}
          </select>
          <button className="btn-config-save" onClick={handleSaveHorario}>Guardar</button>
          {horarioSaved && <span style={{ color: 'var(--success)', fontSize: '13px' }}>✓ Guardado</span>}
        </div>
      </div>

      {/* Cierre por fecha */}
      <div className="config-section">
        <div className="config-section-title">📋 Cierre por fecha</div>
        <p className="config-section-desc">Cerrá los pedidos hasta una fecha específica (imprevistos, vacaciones).</p>
        {config.cierreHasta && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', padding: '10px 12px', background: '#FFF8EC', border: '1px solid var(--gold)', borderRadius: '8px', fontSize: '13px' }}>
            <span>⚠️ Cerrado hasta <strong>{config.cierreHasta}</strong></span>
            <button
              onClick={() => { axios.delete(`${API_URL}/api/config/extender`); onLevantarCierre && onLevantarCierre(); }}
              style={{ marginLeft: 'auto', background: '#2E7D32', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}
            >Levantar cierre</button>
          </div>
        )}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
          <input
            type="date"
            value={cierreHastaInput}
            onChange={e => setCierreHastaInput(e.target.value)}
            min={new Date().toLocaleDateString('sv-SE')}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--border)', fontFamily: 'inherit', fontSize: '14px' }}
          />
          <button className="btn-config-save" onClick={handleCierreHasta}>Aplicar</button>
        </div>
      </div>

      {/* Radio de entrega */}
      <div className="config-section">
        <div className="config-section-title">📍 Radio de entrega</div>
        <p className="config-section-desc">Distancia máxima desde Albarracín 1241, Temperley.</p>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
          <input
            type="number"
            min="0.5"
            max="10"
            step="0.5"
            value={radioKm}
            onChange={e => setRadioKm(parseFloat(e.target.value))}
            style={{ width: '80px', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid var(--border)', fontFamily: 'inherit', fontSize: '14px' }}
          />
          <span style={{ fontSize: '14px', color: 'var(--muted)' }}>km</span>
          <button className="btn-config-save" onClick={handleSaveRadio}>Guardar</button>
          {radioSaved && <span style={{ color: 'var(--success)', fontSize: '13px' }}>✓ Guardado</span>}
        </div>
      </div>

      {/* Precios */}
      <PricesView />

    </div>
  );
}
