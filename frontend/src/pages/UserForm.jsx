import React, { useState } from 'react';
import axios from 'axios';
import './UserForm.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function UserForm() {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    fecha: '',
    desde: '',
    hasta: '',
    pago: ''
  });
  const [qtys, setQtys] = useState({ individual: 0, media: 0, clasico: 0, familiar: 0 });
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [comprobante, setComprobante] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateError, setDateError] = useState(false);

  const today = new Date();
  const next7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
  const formatDateISO = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const daysStr = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const minDate = formatDateISO(today);
  const maxDateObj = new Date(today);
  maxDateObj.setDate(today.getDate() + 30);
  const maxDate = formatDateISO(maxDateObj);

  const precios = { individual: 2200, media: 3800, clasico: 5500, familiar: 8000 };
  const nombres = { individual: 'Pack Individual', media: 'Pack Media Docena', clasico: 'Pack Clásico', familiar: 'Pack Familiar' };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const cambiarQty = (pack, delta) => {
    setQtys(prev => ({
      ...prev,
      [pack]: Math.max(0, prev[pack] + delta)
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setComprobante(e.target.files[0]);
    }
  };

  const handleAddressBlur = async () => {
    if (!formData.direccion) return;
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formData.direccion)}&countrycodes=ar&format=json&limit=1`);
      if (res.data && res.data.length > 0) {
        setCoords({ lat: res.data[0].lat, lng: res.data[0].lon });
      } else {
        setCoords({ lat: null, lng: null });
      }
    } catch (err) {
      console.error(err);
      setCoords({ lat: null, lng: null });
    }
  };

  const resumenLineas = [];
  let total = 0;
  for (const k in qtys) {
    if (qtys[k] > 0) {
      const sub = qtys[k] * precios[k];
      total += sub;
      resumenLineas.push(`${qtys[k]} × ${nombres[k]}`);
    }
  }

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.telefono || !formData.direccion) {
      alert('Completá tus datos personales.');
      return;
    }
    const totalPacks = Object.values(qtys).reduce((a, b) => a + b, 0);
    if (totalPacks === 0) {
      alert('Seleccioná al menos un pack.');
      return;
    }
    if (!formData.fecha) {
      setDateError(true);
      return;
    }
    if (!formData.desde || !formData.hasta) {
      alert('Indicá el horario de entrega.');
      return;
    }
    if (formData.desde >= formData.hasta) {
      alert('El horario "hasta" debe ser posterior al "desde".');
      return;
    }
    if (!formData.pago) {
      alert('Elegí un método de pago.');
      return;
    }
    if (formData.pago === 'transferencia' && !comprobante) {
      alert('Adjuntá el comprobante de transferencia.');
      return;
    }

    const data = new FormData();
    data.append('nombre', formData.nombre);
    data.append('telefono', formData.telefono);
    data.append('direccion', formData.direccion);
    data.append('fecha', formData.fecha);
    data.append('desde', formData.desde);
    data.append('hasta', formData.hasta);
    data.append('pago', formData.pago);
    
    const paqueteStr = resumenLineas.join(', ');
    data.append('paquete', paqueteStr);

    if (comprobante) data.append('comprobante', comprobante);
    
    if (coords.lat) data.append('lat', coords.lat);
    if (coords.lng) data.append('lng', coords.lng);

    await sendData(data);
  };

  const sendData = async (data) => {
    try {
      await axios.post(`${API_URL}/api/orders`, data);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Hubo un error al enviar el pedido');
    }
  };

  if (submitted) {
    return (
      <div className="success-screen visible">
        <div className="success-icon">✓</div>
        <h2>¡Pedido recibido!</h2>
        <p>Gracias, <span style={{fontWeight:500,color:'var(--brown)'}}>{formData.nombre}</span>.<br/>Te escribimos por WhatsApp para confirmar tu pedido.</p>
      </div>
    );
  }

  return (
    <>
      <div className="hero">
        <div className="hero-label">Pedidos online</div>
        <h1>Medialunas<br/><em>artesanales</em></h1>
        <p className="hero-desc">De manteca, hechas con amor. Pedí tu pack y las recibís en el día.</p>
        <div className="divider"><span>🥐</span></div>
      </div>

      <div className="form-container">
        <p className="section-title">Tus datos</p>

        <div className="field">
          <label className="field-label">Nombre completo</label>
          <input type="text" value={formData.nombre} onChange={e => handleInputChange('nombre', e.target.value)} placeholder="Ej: María García" />
        </div>

        <div className="field">
          <label className="field-label">Teléfono / WhatsApp</label>
          <input type="tel" value={formData.telefono} onChange={e => handleInputChange('telefono', e.target.value)} placeholder="Ej: 11 1234-5678" />
        </div>

        <div className="field">
          <label className="field-label">Dirección de entrega</label>
          <input type="text" value={formData.direccion} onChange={e => handleInputChange('direccion', e.target.value)} onBlur={handleAddressBlur} placeholder="Ej: Av. Corrientes 1234, CABA" />
        </div>

        <p className="section-title" style={{marginTop:'22px'}}>Elegí tus packs</p>

        <div className="packs-list">
          {Object.keys(precios).map(packKey => (
            <div key={packKey} className={`pack-row ${qtys[packKey] > 0 ? 'active' : ''}`}>
              <div className="pack-info">
                <div className="pack-name">{nombres[packKey]}</div>
                <div className="pack-price">${precios[packKey].toLocaleString('es-AR')}</div>
              </div>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => cambiarQty(packKey, -1)} disabled={qtys[packKey] === 0}>−</button>
                <span className="qty-num">{qtys[packKey]}</span>
                <button className="qty-btn" onClick={() => cambiarQty(packKey, 1)}>+</button>
              </div>
            </div>
          ))}
        </div>

        {resumenLineas.length > 0 && (
          <div className="resumen visible">
            <div className="resumen-title">Resumen del pedido</div>
            <div className="resumen-items">
              {Object.keys(qtys).map(k => qtys[k] > 0 && (
                <div key={k}>{qtys[k]} × {nombres[k]} — ${(qtys[k] * precios[k]).toLocaleString('es-AR')}</div>
              ))}
            </div>
            <div className="resumen-total">Total: ${total.toLocaleString('es-AR')}</div>
          </div>
        )}

        <p className="section-title" style={{marginTop:'22px'}}>Fecha de entrega</p>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px', scrollbarWidth: 'none' }}>
          {next7Days.map(d => {
            const iso = formatDateISO(d);
            const isSelected = formData.fecha === iso;
            return (
              <button 
                key={iso}
                type="button"
                onClick={() => { handleInputChange('fecha', iso); setDateError(false); }}
                style={{
                  flex: '0 0 auto',
                  minWidth: '60px',
                  padding: '10px',
                  borderRadius: '8px',
                  border: isSelected ? '2px solid var(--brown)' : '1px solid var(--border)',
                  background: isSelected ? '#fdf8f5' : '#fff',
                  color: isSelected ? 'var(--brown)' : 'inherit',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 500 }}>{daysStr[d.getDay()]}</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{d.getDate()}</span>
              </button>
            );
          })}
        </div>
        {!showCalendar ? (
          <button 
            type="button"
            onClick={() => setShowCalendar(true)}
            style={{ marginTop: '5px', background: 'none', border: 'none', color: 'var(--brown)', fontWeight: 500, cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
          >
            Ver más fechas
          </button>
        ) : (
          <div style={{ marginTop: '10px' }}>
            <input 
              type="date" 
              value={formData.fecha}
              min={minDate}
              max={maxDate}
              onChange={e => { handleInputChange('fecha', e.target.value); setDateError(false); }}
              style={{
                padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', width: '100%', maxWidth: '200px', outline: 'none'
              }}
            />
            {formData.fecha && !next7Days.find(d => formatDateISO(d) === formData.fecha) && (
              <div style={{ marginTop: '8px', fontSize: '14px', color: 'var(--brown)', fontWeight: 500 }}>
                Fecha seleccionada: {formData.fecha.split('-').reverse().join('/')}
              </div>
            )}
          </div>
        )}
        {dateError && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>Debe seleccionar una fecha.</div>}

        <p className="section-title" style={{marginTop:'22px'}}>Horario de entrega</p>

        <div className="field">
          <label className="field-label">¿A partir de qué hora podés recibir?</label>
          <div className="horario-row">
            <div>
              <label className="field-label">Desde</label>
              <input type="time" value={formData.desde} onChange={e => handleInputChange('desde', e.target.value)} min="08:00" max="20:00" />
            </div>
            <div className="horario-sep">—</div>
            <div>
              <label className="field-label">Hasta</label>
              <input type="time" value={formData.hasta} onChange={e => handleInputChange('hasta', e.target.value)} min="08:00" max="20:00" />
            </div>
          </div>
        </div>

        <p className="section-title" style={{marginTop:'22px'}}>Método de pago</p>

        <div className="payment-options">
          <label className={`pay-option ${formData.pago === 'transferencia' ? 'selected' : ''}`} onClick={() => handleInputChange('pago', 'transferencia')}>
            <div className="pay-icon">🏦</div>
            <div className="pay-label">Transferencia</div>
            <div className="pay-sub">Adjuntá comprobante</div>
          </label>
          <label className={`pay-option ${formData.pago === 'efectivo' ? 'selected' : ''}`} onClick={() => handleInputChange('pago', 'efectivo')}>
            <div className="pay-icon">💵</div>
            <div className="pay-label">Efectivo</div>
            <div className="pay-sub">Al momento de entrega</div>
          </label>
        </div>

        {formData.pago === 'transferencia' && (
          <div className="comprobante-field visible">
            <label className="field-label">Comprobante de transferencia</label>
            <div className={`upload-area ${comprobante ? 'has-file' : ''}`}>
              <input type="file" accept="image/*,.pdf" onChange={handleFileChange} />
              <div className="upload-icon">📎</div>
              <div className="upload-text">
                <strong>Tocá para adjuntar</strong><br/>
                JPG, PNG o PDF
              </div>
              {comprobante && <div className="file-name" style={{display:'block'}}>✓ {comprobante.name}</div>}
            </div>
          </div>
        )}

        <button className="submit-btn" onClick={handleSubmit}>
          Enviar pedido <span className="btn-gold">→</span>
        </button>

        <p className="note">Te contactaremos por WhatsApp para confirmar 🥐</p>
      </div>
    </>
  );
}
