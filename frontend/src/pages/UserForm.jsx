import { useState, useEffect } from 'react';
import useOrderForm from '../hooks/useOrderForm.js';
import DaySelector from '../components/DaySelector/DaySelector.jsx';
import PackSelector from '../components/PackSelector/PackSelector.jsx';
import TimeSelector from '../components/TimeSelector/TimeSelector.jsx';
import PaymentSelector from '../components/PaymentSelector/PaymentSelector.jsx';
import OrderSummary from '../components/OrderSummary/OrderSummary.jsx';
import './UserForm.css';

import axios from 'axios';
import logoImg from '../assets/logo-etiqueta-pedido.jpg';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const CheckMark = () => <span style={{ color: '#2E7D32', marginLeft: '8px', fontSize: '18px' }}>✓</span>;

export default function UserForm() {
  const {
    formData, handleInputChange,
    qtys, cambiarQty,
    submitted,
    showCalendar, setShowCalendar,
    dateError, setDateError,
    isSubmitting,
    comprobanteEnviado, setComprobanteEnviado,
    anticipationError, setAnticipationError,
    scrollRef, canScrollLeft, canScrollRight, handleScroll, scrollByAmount,
    todayISO, tomorrowObj, next7Days, daysStr, formatDateISO, parseLocalDate, maxDateObj, getSelectedDateText,
    resumenLineas, total,
    packsCompletos, fechaCompleta, horarioCompleto, pagoCompleto, formValido, datosCompletos,
    handleSubmit, handleAddressBlur, selectSuggestion,
    precios, nombres, addressSuggestions, isSearchingAddress, setAddressSuggestions, outsideRadius,
  } = useOrderForm();

  const [config, setConfig] = useState({ formularioAbierto: true, horarioCierre: '05:00' });
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/config/estado`);
        setConfig(res.data);
      } catch (err) {
        console.error('Error fetching config:', err);
      }
    };
    fetchConfig();
  }, []);

  const isClosedForTomorrow = !config.formularioAbierto;
  const currentHour = new Date().getHours();
  const showCutoffBanner = config.formularioAbierto && currentHour >= 0 && currentHour < 5 && !bannerDismissed;
  
  // Calcular la primera fecha de entrega disponible
  const getFirstAvailableDate = () => {
    const deliveryDays = [];
    let dIterator = new Date();
    dIterator.setDate(dIterator.getDate() + 1); // Empezar desde mañana

    while (deliveryDays.length < 7) {
      if (dIterator.getDay() !== 0 && dIterator.getDay() !== 6) {
        deliveryDays.push(new Date(dIterator));
      }
      dIterator.setDate(dIterator.getDate() + 1);
    }

    if (isClosedForTomorrow) {
      return deliveryDays[1];
    }
    return deliveryDays[0];
  };

  const firstAvailableDate = getFirstAvailableDate();
  const firstAvailableDateText = `${firstAvailableDate.getDate()}/${firstAvailableDate.getMonth() + 1}`;

  const getSelectableDays = () => {
    if (!isClosedForTomorrow) {
      return next7Days;
    }
    const selectable = [];
    let dIterator = new Date(firstAvailableDate);
    while (selectable.length < 7) {
      if (dIterator.getDay() !== 0 && dIterator.getDay() !== 6) {
        selectable.push(new Date(dIterator));
      }
      dIterator.setDate(dIterator.getDate() + 1);
    }
    return selectable;
  };

  // Ajustar fecha mínima si está cerrado para la próxima fecha
  useEffect(() => {
    if (isClosedForTomorrow && formData.fecha) {
      const selectedDate = parseLocalDate(formData.fecha);
      if (selectedDate && selectedDate < firstAvailableDate) {
        handleInputChange('fecha', formatDateISO(firstAvailableDate));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClosedForTomorrow, formData.fecha]);

  if (submitted) {
    return <OrderSummary formData={formData} resumenLineas={resumenLineas} total={total} daysStr={daysStr} />;
  }

  return (
    <>
      {isClosedForTomorrow ? (
        <div style={{
          background: '#FFFBE6',
          border: '1.5px solid #FF9800',
          borderRadius: '16px',
          padding: '40px 24px',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '20px auto 30px auto',
          boxShadow: '0 4px 12px rgba(255, 152, 0, 0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <h2 style={{ color: '#856404', fontSize: '22px', marginBottom: '12px', fontWeight: 'bold' }}>
            Pedidos cerrados por el momento
          </h2>
          <p style={{ color: '#856404', fontSize: '16px', lineHeight: '1.5', margin: 0 }}>
            No estamos recibiendo pedidos para la fecha más próxima.<br />
            <strong>Podés reservar a partir del {firstAvailableDateText}.</strong>
          </p>
        </div>
      ) : (
        <div className="hero">
          <img src={logoImg} alt="e-COMMER-ce Medialunas" style={{ width: '160px', height: '160px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.1)', marginBottom: '24px', display: 'block', margin: '0 auto 24px auto', boxShadow: '0 6px 20px rgba(0,0,0,0.2)' }} />
          <h1>Pedí tus medialunas<br /><em>recién horneadas</em></h1>
          <p className="hero-desc">Elegí tu pack favorito y te lo llevamos. 🥐</p>
          <div className="hero-label-container">
            <span className="hero-label-line"></span>
            <span className="hero-label-text">PEDIDOS ONLINE</span>
            <span className="hero-label-line"></span>
          </div>
        </div>
      )}

      {showCutoffBanner && (
        <div style={{
          maxWidth: '500px',
          margin: '24px auto 20px auto',
          padding: '12px 16px',
          backgroundColor: '#FFFBE6',
          border: '1px solid #FF9800',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          position: 'relative'
        }}>
          <span style={{ fontSize: '14px', color: '#856404', lineHeight: '1.4', flex: 1 }}>
            ⚠️ Los pedidos realizados después de las 00hs están sujetos a disponibilidad de stock. Te contactaremos para confirmar.
          </span>
          <button 
            onClick={() => setBannerDismissed(true)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#856404',
              padding: '0',
              lineHeight: '1'
            }}
          >
            ✕
          </button>
        </div>
      )}

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
          .days-scroll-wrapper > div::-webkit-scrollbar { display: none; }
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
            width: 32px; height: 32px;
            align-items: center; justify-content: center;
            cursor: pointer;
            flex-shrink: 0;
            transition: all 0.2s;
          }
          .nav-arrow:hover { background: var(--brown); color: white; }
          @media (min-width: 768px) { .nav-arrow { display: flex; } }
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
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type="text" 
              value={formData.direccion} 
              onChange={e => handleInputChange('direccion', e.target.value)} 
              onBlur={() => { handleAddressBlur(); setTimeout(() => setAddressSuggestions([]), 200); }}
              placeholder="Ej: Av. Corrientes 1234, CABA" 
              style={{ width: '100%' }}
            />
            {isSearchingAddress && (
              <div style={{ 
                position: 'absolute', right: '12px', top: 0, bottom: 0, margin: 'auto',
                width: '18px', height: '18px', border: '2px solid rgba(196,146,42,0.1)', 
                borderTop: '2px solid var(--brown)', borderRadius: '50%', 
                animation: 'userform-spinner 1s linear infinite',
                pointerEvents: 'none'
              }} />
            )}
            {addressSuggestions.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, marginTop: '4px', overflow: 'hidden' }}>
                {addressSuggestions.map((s, i) => (
                  <div 
                    key={i} 
                    onClick={() => selectSuggestion(s)}
                    style={{ padding: '10px 12px', fontSize: '13px', cursor: 'pointer', borderBottom: i < addressSuggestions.length - 1 ? '1px solid #f0f0f0' : 'none', color: 'var(--brown)', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fdf8f5'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    📍 {s.cleanName}
                  </div>
                ))}
              </div>
            )}
          </div>
          {outsideRadius && (
            <div style={{ marginTop: '8px', padding: '10px 12px', background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', fontSize: '13px', color: '#991B1B' }}>
              📍 Lo sentimos, tu dirección está fuera de nuestra zona de entrega.
            </div>
          )}
        </div>

        <PackSelector qtys={qtys} cambiarQty={cambiarQty} precios={precios} nombres={nombres} resumenLineas={resumenLineas} total={total} packsCompletos={packsCompletos} />

        <p className="section-title" style={{ marginTop: '22px' }}>Fecha de entrega{fechaCompleta && <CheckMark />}</p>
        <DaySelector
          next7Days={getSelectableDays()} formatDateISO={formatDateISO} todayISO={todayISO} daysStr={daysStr}
          fecha={formData.fecha} handleInputChange={handleInputChange}
          setDateError={setDateError} setAnticipationError={setAnticipationError}
          showCalendar={showCalendar} setShowCalendar={setShowCalendar}
          parseLocalDate={parseLocalDate} tomorrowObj={isClosedForTomorrow ? firstAvailableDate : tomorrowObj} maxDateObj={maxDateObj}
          canScrollLeft={canScrollLeft} canScrollRight={canScrollRight}
          scrollRef={scrollRef} scrollByAmount={scrollByAmount} handleScroll={handleScroll}
          dateError={dateError} anticipationError={anticipationError} getSelectedDateText={getSelectedDateText}
        />

        <TimeSelector desde={formData.desde} hasta={formData.hasta} handleInputChange={handleInputChange} horarioCompleto={horarioCompleto} />

        <PaymentSelector pago={formData.pago} handleInputChange={handleInputChange} comprobanteEnviado={comprobanteEnviado} setComprobanteEnviado={setComprobanteEnviado} pagoCompleto={pagoCompleto} />

        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={isSubmitting || !formValido}
          style={{ opacity: isSubmitting || !formValido ? 0.4 : 1, cursor: isSubmitting || !formValido ? 'not-allowed' : 'pointer', transition: 'opacity 0.3s ease' }}
        >
          {isSubmitting ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'userform-spinner 1s linear infinite' }} />
              Procesando...
            </span>
          ) : (
            <>FINALIZAR PEDIDO</>
          )}
        </button>

        <p className="note">Te contactaremos por WhatsApp para confirmar 🥐</p>
      </div>
    </>
  );
}
