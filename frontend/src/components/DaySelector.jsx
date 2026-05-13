import React from 'react';
import DatePicker from 'react-datepicker';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

export default function DaySelector({
  next7Days, formatDateISO, todayISO, daysStr, fecha, handleInputChange,
  setDateError, setAnticipationError, showCalendar, setShowCalendar,
  parseLocalDate, tomorrowObj, maxDateObj, canScrollLeft, canScrollRight,
  scrollRef, scrollByAmount, handleScroll, dateError, anticipationError, getSelectedDateText,
}) {
  return (
    <>
      {!showCalendar ? (
        <div style={{ border: '1.5px solid var(--border)', borderRadius: '10px', padding: '12px', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="nav-arrow"
              onClick={() => scrollByAmount(-150)}
              style={{ opacity: canScrollLeft ? 1 : 0.3, pointerEvents: canScrollLeft ? 'auto' : 'none' }}
            >←</button>

            <div className={`days-scroll-wrapper ${canScrollLeft ? 'can-scroll-left' : ''} ${canScrollRight ? 'can-scroll-right' : ''}`}>
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px', scrollbarWidth: 'none', msOverflowStyle: 'none', flex: 1 }}
              >
                {next7Days.map(d => {
                  const iso = formatDateISO(d);
                  const isSelected = fecha === iso;
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
                        flex: '0 0 auto', minWidth: '60px', padding: '10px', borderRadius: '8px',
                        border: isSelected ? '2px solid var(--brown)' : '1px solid var(--border)',
                        background: isSelected ? '#fdf8f5' : '#fff',
                        color: isSelected ? 'var(--brown)' : 'inherit',
                        cursor: isToday ? 'not-allowed' : 'pointer',
                        opacity: isToday ? 0.4 : 1,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
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
            >→</button>
          </div>

          <button
            type="button"
            onClick={() => setShowCalendar(true)}
            style={{ marginTop: '10px', background: 'none', border: 'none', color: 'var(--brown)', fontWeight: 500, cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
          >Elegir otra fecha →</button>
        </div>
      ) : (
        <div style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
          <DatePicker
            selected={parseLocalDate(fecha)}
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
          >← Volver</button>
        </div>
      )}

      {fecha && (
        <div style={{ marginTop: '10px', color: '#2E7D32', fontWeight: 500, fontSize: '14px' }}>
          {getSelectedDateText()}
        </div>
      )}
      {dateError && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>Debe seleccionar una fecha.</div>}
      {anticipationError && <div style={{ color: 'red', fontSize: '12px', marginTop: '5px', fontWeight: 600 }}>Los pedidos deben realizarse con al menos 24hs de anticipación.</div>}
    </>
  );
}
