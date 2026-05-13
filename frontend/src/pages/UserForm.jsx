import React from 'react';
import useOrderForm from '../hooks/useOrderForm.js';
import DaySelector from '../components/DaySelector.jsx';
import PackSelector from '../components/PackSelector.jsx';
import TimeSelector from '../components/TimeSelector.jsx';
import PaymentSelector from '../components/PaymentSelector.jsx';
import OrderSummary from '../components/OrderSummary.jsx';

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
    handleSubmit, handleAddressBlur,
    precios, nombres,
  } = useOrderForm();

  const CheckMark = () => <span style={{ color: '#2E7D32', marginLeft: '8px', fontSize: '18px' }}>✓</span>;

  if (submitted) {
    return <OrderSummary formData={formData} resumenLineas={resumenLineas} total={total} daysStr={daysStr} />;
  }

  return (
    <>
      <div className="hero">
        <div className="hero-label">Pedidos online</div>
        <h1>Medialunas<br /><em>artesanales</em></h1>
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
          <input type="text" value={formData.direccion} onChange={e => handleInputChange('direccion', e.target.value)} onBlur={handleAddressBlur} placeholder="Ej: Av. Corrientes 1234, CABA" />
        </div>

        <PackSelector qtys={qtys} cambiarQty={cambiarQty} precios={precios} nombres={nombres} resumenLineas={resumenLineas} total={total} packsCompletos={packsCompletos} />

        <p className="section-title" style={{ marginTop: '22px' }}>Fecha de entrega{fechaCompleta && <CheckMark />}</p>
        <DaySelector
          next7Days={next7Days} formatDateISO={formatDateISO} todayISO={todayISO} daysStr={daysStr}
          fecha={formData.fecha} handleInputChange={handleInputChange}
          setDateError={setDateError} setAnticipationError={setAnticipationError}
          showCalendar={showCalendar} setShowCalendar={setShowCalendar}
          parseLocalDate={parseLocalDate} tomorrowObj={tomorrowObj} maxDateObj={maxDateObj}
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
