import DatePicker from 'react-datepicker';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import './DaySelector.css';

export default function DaySelector({
  next7Days, formatDateISO, todayISO, daysStr, fecha, handleInputChange,
  setDateError, setAnticipationError, showCalendar, setShowCalendar,
  parseLocalDate, tomorrowObj, maxDateObj, canScrollLeft, canScrollRight,
  scrollRef, scrollByAmount, handleScroll, dateError, anticipationError, getSelectedDateText,
}) {
  return (
    <div className="day-selector-container">
      {!showCalendar ? (
        <div className="day-selector-card">
          <div className="day-selector-row">
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
                className="days-scroll-container"
              >
                {next7Days.map(d => {
                  const iso = formatDateISO(d);
                  const isSelected = fecha === iso;
                  const isToday = iso === todayISO;
                  return (
                    <button
                      key={iso}
                      type="button"
                      className={`day-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        if (isToday) return;
                        handleInputChange('fecha', iso);
                        setDateError(false);
                        setAnticipationError(false);
                      }}
                      disabled={isToday}
                    >
                      <span className="day-name-label">{daysStr[d.getDay()]}</span>
                      <span className="day-num-label">{d.getDate()}</span>
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
            className="btn-show-calendar"
            onClick={() => setShowCalendar(true)}
          >Elegir otra fecha →</button>
        </div>
      ) : (
        <div className="calendar-wrapper">
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
            filterDate={(date) => date.getDay() !== 0 && date.getDay() !== 6}
            locale={es}
            dateFormat="dd/MM/yyyy"
            inline
          />
          <button
            type="button"
            className="btn-show-calendar"
            onClick={() => setShowCalendar(false)}
          >← Volver</button>
        </div>
      )}

      {fecha && (
        <div className="selected-date-feedback">
          {getSelectedDateText()}
        </div>
      )}
      {dateError && <div className="error-text">Debe seleccionar una fecha.</div>}
      {anticipationError && <div className="error-text bold">Los pedidos deben realizarse con al menos 24hs de anticipación.</div>}
    </div>
  );
}
