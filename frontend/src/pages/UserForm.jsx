import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
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
  const [submitted, setSubmitted] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comprobanteEnviado, setComprobanteEnviado] = useState(false);
  const [anticipationError, setAnticipationError] = useState(false);

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [showCalendar]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheelNative = (e) => {
      if (e.deltaY !== 0) {
        const isScrollingRight = e.deltaY > 0 && Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth;
        const isScrollingLeft = e.deltaY < 0 && el.scrollLeft > 0;
        if (isScrollingRight || isScrollingLeft) {
          e.preventDefault();
          el.scrollBy({ left: e.deltaY, behavior: 'auto' });
        }
      }
    };
    el.addEventListener('wheel', onWheelNative, { passive: false });
    return () => el.removeEventListener('wheel', onWheelNative);
  }, [showCalendar]);

  const scrollByAmount = (amount) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const today = new Date();
  const formatDateISO = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const todayISO = formatDateISO(today);
  const tomorrowObj = new Date(today);
  tomorrowObj.setDate(today.getDate() + 1);

  useEffect(() => {
    if (formData.fecha === todayISO) {
      setFormData(prev => ({ ...prev, fecha: '' }));
      setAnticipationError(true);
    } else if (formData.fecha) {
      setAnticipationError(false);
    }
  }, [formData.fecha, todayISO]);

  const next7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
  const daysStr = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const minDate = formatDateISO(tomorrowObj);
  const maxDateObj = new Date(today);
  maxDateObj.setDate(today.getDate() + 30);
  const maxDate = formatDateISO(maxDateObj);

  const parseLocalDate = (isoStr) => {
    if (!isoStr) return null;
    const [y, m, d] = isoStr.split('-');
    return new Date(y, m - 1, d);
  };

  const getSelectedDateText = () => {
    if (!formData.fecha) return null;
    const [y, m, d] = formData.fecha.split('-');
    const dateObj = new Date(y, m - 1, d);
    return `✓ Entrega el ${daysStr[dateObj.getDay()]} ${d}/${m}/${y}`;
  };

  const precios = { individual: 2200, media: 3800, clasico: 5500, familiar: 8000 };
  const nombres = { individual: 'Pack Individual', media: 'Pack Media Docena', clasico: 'Pack Clásico', familiar: 'Pack Familiar' };

  const handleInputChange = (field, value) => {
    if (field === 'pago') setComprobanteEnviado(false);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const cambiarQty = (pack, delta) => {
    setQtys(prev => ({
      ...prev,
      [pack]: Math.max(0, prev[pack] + delta)
    }));
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

  const nombreValido = formData.nombre.trim().length >= 3;
  const telefonoValido = formData.telefono.replace(/\D/g, '').length >= 10;
  const direccionValida = formData.direccion.trim().length >= 5;
  const totalPacks = Object.values(qtys).reduce((a, b) => a + b, 0);
  const packsCompletos = totalPacks > 0;
  const fechaCompleta = !!formData.fecha;
  const horarioCompleto = formData.desde && formData.hasta && formData.desde < formData.hasta;
  const pagoSeleccionado = !!formData.pago;
  const pagoCompleto = pagoSeleccionado && (formData.pago !== 'transferencia' || comprobanteEnviado);

  const formValido = nombreValido && telefonoValido && direccionValida && packsCompletos && fechaCompleta && horarioCompleto && pagoCompleto;

  const datosCompletos = formData.nombre && formData.telefono && formData.direccion;
  
  const CheckMark = () => <span style={{color: '#2E7D32', marginLeft: '8px', fontSize: '18px'}}>✓</span>;

  const handleSubmit = async () => {
    if (!datosCompletos) {
      alert('Completá tus datos personales.');
      return;
    }
    if (!packsCompletos) {
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
    
    if (coords.lat) data.append('lat', coords.lat);
    if (coords.lng) data.append('lng', coords.lng);

    setIsSubmitting(true);
    await sendData(data);
  };

  const sendData = async (data) => {
    try {
      await axios.post(`${API_URL}/api/orders`, data);
      setSubmitted(true);
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      alert('Hubo un error al enviar el pedido');
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="success-screen visible" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', boxSizing: 'border-box' }}>
        <div className="success-icon">✓</div>
        <h2 style={{color: 'var(--brown)', marginBottom: '20px', textAlign: 'center'}}>¡Pedido recibido!</h2>
        
        <div style={{background: '#fff', padding: '25px', borderRadius: '16px', border: '1px solid var(--gold)', textAlign: 'left', marginBottom: '25px', width: '100%', maxWidth: '400px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)'}}>
          <h3 style={{marginTop: 0, color: 'var(--brown)', fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '15px', textAlign: 'center'}}>Resumen del pedido</h3>
          
          <p style={{margin: '8px 0', color: '#555'}}><strong style={{color: 'var(--brown)'}}>Nombre:</strong> {formData.nombre}</p>
          <p style={{margin: '8px 0', color: '#555'}}><strong style={{color: 'var(--brown)'}}>Teléfono:</strong> {formData.telefono}</p>
          <p style={{margin: '8px 0', color: '#555'}}><strong style={{color: 'var(--brown)'}}>Dirección:</strong> {formData.direccion}</p>
          <p style={{margin: '8px 0', color: '#555'}}><strong style={{color: 'var(--brown)'}}>Entrega:</strong> {formData.fecha.split('-').reverse().join('/')} ({formData.desde} a {formData.hasta})</p>
          
          <div style={{marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed var(--border)'}}>
            <strong style={{color: 'var(--brown)', display: 'block', marginBottom: '8px'}}>Packs:</strong>
            {resumenLineas.map((line, idx) => (
              <div key={idx} style={{color: '#555', fontSize: '15px', margin: '4px 0'}}>• {line}</div>
            ))}
          </div>

          <div style={{marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <strong style={{color: 'var(--brown)', fontSize: '16px'}}>Total a pagar:</strong>
            <span style={{color: 'var(--gold)', fontWeight: 'bold', fontSize: '20px'}}>${total.toLocaleString('es-AR')}</span>
          </div>
          
          <div style={{marginTop: '15px', color: '#555', fontSize: '15px', textAlign: 'center', background: '#fdf8f5', padding: '10px', borderRadius: '8px'}}>
            <strong style={{color: 'var(--brown)'}}>Método de pago:</strong><br/>{formData.pago === 'efectivo' ? 'Efectivo al recibir' : 'Transferencia'}
          </div>
        </div>

        <p style={{fontWeight: 500, color: 'var(--brown)', textAlign: 'center', fontSize: '16px'}}>Te contactaremos por WhatsApp para confirmar 🥐</p>
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
        <style>{`
          @keyframes userform-spinner {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .days-scroll-wrapper {
            position: relative;
            flex: 1;
            overflow: hidden;
            display: flex;
          }
          .days-scroll-wrapper > div::-webkit-scrollbar {
            display: none;
          }
          .days-scroll-wrapper.can-scroll-left::before {
            content: '';
            position: absolute;
            top: 0; left: 0; bottom: 0; width: 40px;
            background: linear-gradient(to right, #fff, transparent);
            pointer-events: none;
            z-index: 2;
          }
          .days-scroll-wrapper.can-scroll-right::after {
            content: '';
            position: absolute;
            top: 0; right: 0; bottom: 0; width: 40px;
            background: linear-gradient(to left, #fff, transparent);
            pointer-events: none;
            z-index: 2;
          }
          .nav-arrow {
            display: none;
            background: #fdf8f5;
            border: 1px solid var(--border);
            color: var(--brown);
            border-radius: 50%;
            width: 32px;
            height: 32px;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            flex-shrink: 0;
            transition: all 0.2s;
          }
          .nav-arrow:hover {
            background: var(--brown);
            color: white;
          }
          @media (min-width: 768px) {
            .nav-arrow {
              display: flex;
            }
          }
        `}</style>
        <p className="section-title">Tus datos{datosCompletos && <CheckMark />}</p>

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

        <p className="section-title" style={{marginTop:'22px'}}>Elegí tus packs{packsCompletos && <CheckMark />}</p>

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

        <p className="section-title" style={{marginTop:'22px'}}>Fecha de entrega{fechaCompleta && <CheckMark />}</p>
        
        {!showCalendar ? (
          <div style={{ border: '1.5px solid var(--border)', borderRadius: '10px', padding: '12px', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                type="button" 
                className="nav-arrow"
                onClick={() => scrollByAmount(-150)}
                style={{ opacity: canScrollLeft ? 1 : 0.3, pointerEvents: canScrollLeft ? 'auto' : 'none' }}
              >
                ←
              </button>

              <div className={`days-scroll-wrapper ${canScrollLeft ? 'can-scroll-left' : ''} ${canScrollRight ? 'can-scroll-right' : ''}`}>
                <div 
                  ref={scrollRef}
                  onScroll={handleScroll}
                  style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px', scrollbarWidth: 'none', msOverflowStyle: 'none', flex: 1 }}
                >
                  {next7Days.map(d => {
                    const iso = formatDateISO(d);
                    const isSelected = formData.fecha === iso;
                    const isToday = iso === todayISO;
                    return (
                      <button 
                        key={iso}
                        type="button"
                        onClick={() => { 
                          if (isToday) return;
                          handleInputChange('fecha', iso); 
                          setDateError(false);
                          setAnticipationError(false);
                        }}
                        disabled={isToday}
                        style={{
                          flex: '0 0 auto',
                          minWidth: '60px',
                          padding: '10px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid var(--brown)' : '1px solid var(--border)',
                          background: isSelected ? '#fdf8f5' : '#fff',
                          color: isSelected ? 'var(--brown)' : 'inherit',
                          cursor: isToday ? 'not-allowed' : 'pointer',
                          opacity: isToday ? 0.4 : 1,
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
              </div>

              <button 
                type="button" 
                className="nav-arrow"
                onClick={() => scrollByAmount(150)}
                style={{ opacity: canScrollRight ? 1 : 0.3, pointerEvents: canScrollRight ? 'auto' : 'none' }}
              >
                →
              </button>
            </div>
            
            <button 
              type="button"
              onClick={() => setShowCalendar(true)}
              style={{ marginTop: '10px', background: 'none', border: 'none', color: 'var(--brown)', fontWeight: 500, cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
            >
              Elegir otra fecha →
            </button>
          </div>
        ) : (
          <div style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
            <DatePicker
              selected={parseLocalDate(formData.fecha)}
              onChange={(date) => {
                if (date) {
                  handleInputChange('fecha', formatDateISO(date));
                  setDateError(false);
                }
              }}
              minDate={tomorrowObj}
              maxDate={maxDateObj}
              locale={es}
              dateFormat="dd/MM/yyyy"
              inline
            />
            <button 
              type="button"
              onClick={() => setShowCalendar(false)}
              style={{ background: 'none', border: 'none', color: 'var(--brown)', fontWeight: 500, cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
            >
              ← Volver
            </button>
          </div>
        )}

        {formData.fecha && (
          <div style={{ marginTop: '10px', color: '#2E7D32', fontWeight: 500, fontSize: '14px' }}>
            {getSelectedDateText()}
          </div>
        )}
        {dateError && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>Debe seleccionar una fecha.</div>}
        {anticipationError && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px', fontWeight: 600 }}>Los pedidos deben realizarse con al menos 24hs de anticipación.</div>}

        <p className="section-title" style={{marginTop:'22px'}}>Horario de entrega{horarioCompleto && <CheckMark />}</p>

        <div className="field">
          <label className="field-label">¿A partir de qué hora podés recibir?</label>
          <div className="horario-row">
            <div>
              <label className="field-label">Desde</label>
              <select value={formData.desde} onChange={e => handleInputChange('desde', e.target.value)}>
                <option value="" disabled hidden>Hora...</option>
                {['08:00', '08:30', '09:00', '09:30', '10:00'].map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
            <div className="horario-sep">—</div>
            <div>
              <label className="field-label">Hasta</label>
              <select value={formData.hasta} onChange={e => handleInputChange('hasta', e.target.value)}>
                <option value="" disabled hidden>Hora...</option>
                {['08:00', '08:30', '09:00', '09:30', '10:00'].map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <p className="section-title" style={{marginTop:'22px'}}>Método de pago{pagoCompleto && <CheckMark />}</p>

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
          <div className="comprobante-field visible" style={{ marginTop: '15px' }}>
            <button 
              type="button"
              onClick={() => {
                setComprobanteEnviado(true);
                window.open('https://wa.me/5491126487393?text=Hola%2C%20realicé%20un%20pedido%20de%20medialunas%20y%20adjunto%20mi%20comprobante%20de%20transferencia%20🥐', '_blank');
              }}
              style={{
                width: '100%',
                background: '#25D366',
                color: 'white',
                border: 'none',
                padding: '18px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'inherit',
                boxShadow: '0 4px 12px rgba(37,211,102,0.2)'
              }}
            >
              Enviar comprobante por WhatsApp 📎
            </button>
            {comprobanteEnviado && (
              <div style={{ color: '#2E7D32', fontSize: '13px', marginTop: '8px', fontWeight: 500, textAlign: 'center' }}>
                ✓ Comprobante enviado por WhatsApp
              </div>
            )}
          </div>
        )}

        <button 
          className="submit-btn" 
          onClick={handleSubmit} 
          disabled={isSubmitting || !formValido}
          style={{ 
            opacity: isSubmitting || !formValido ? 0.4 : 1, 
            cursor: isSubmitting || !formValido ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.3s ease'
          }}
        >
          {isSubmitting ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'userform-spinner 1s linear infinite' }}></div>
              Enviando...
            </span>
          ) : (
            <>Enviar pedido <span className="btn-gold">→</span></>
          )}
        </button>

        <p className="note">Te contactaremos por WhatsApp para confirmar 🥐</p>
      </div>
    </>
  );
}
