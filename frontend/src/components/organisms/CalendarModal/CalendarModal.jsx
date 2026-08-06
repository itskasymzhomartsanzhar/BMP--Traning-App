import { useEffect, useMemo, useState } from 'react'
import { FaChevronLeft, FaChevronRight, FaDumbbell, FaDroplet, FaWeightScale } from 'react-icons/fa6'
import Modal from '../Modal/Modal'
import { useAppUI } from '../../../context/AppUIContext'
import { getCalendarMonth } from '../../../api/analytics'
import './CalendarModal.scss'

const toISO = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function CalendarModal({ onClose }) {
  const { t, language, u } = useAppUI()
  const [monthDate, setMonthDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [days, setDays] = useState({})
  const [selected, setSelected] = useState(() => toISO(new Date()))

  const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`

  useEffect(() => {
    getCalendarMonth(monthKey)
      .then(({ data }) => setDays(data?.days && typeof data.days === 'object' ? data.days : {}))
      .catch(() => setDays({}))
  }, [monthKey])

  const locale = language === 'en' ? 'en-US' : 'ru-RU'
  const monthTitle = monthDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  const weekdays = t('calendar.weekdays').split(',')

  const cells = useMemo(() => {
    const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
    // Неделя начинается с понедельника: у getDay() воскресенье — 0.
    const lead = (first.getDay() + 6) % 7
    const result = Array.from({ length: lead }, () => null)
    for (let day = 1; day <= daysInMonth; day += 1) {
      result.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day))
    }
    return result
  }, [monthDate])

  const shiftMonth = (delta) => {
    setMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  const todayISO = toISO(new Date())
  const selectedData = days[selected]
  const selectedDate = new Date(`${selected}T00:00:00`)
  const selectedTitle = selectedDate.toLocaleDateString(locale, { day: 'numeric', month: 'long', weekday: 'long' })
  const selectedInMonth = selected.startsWith(monthKey)
  const hasSelectedData = Boolean(
    selectedData && (selectedData.workouts?.length || selectedData.water || selectedData.weight != null),
  )

  return (
    <Modal title={t('calendar.title')} onClose={onClose} className="calendar-modal">
      <div className="calendar">
        <div className="calendar__nav">
          <button type="button" className="calendar__nav-btn" onClick={() => shiftMonth(-1)} aria-label={t('calendar.prevMonth')}>
            <FaChevronLeft />
          </button>
          <strong className="calendar__month">{monthTitle}</strong>
          <button type="button" className="calendar__nav-btn" onClick={() => shiftMonth(1)} aria-label={t('calendar.nextMonth')}>
            <FaChevronRight />
          </button>
        </div>

        <div className="calendar__grid" role="grid">
          {weekdays.map((w) => (
            <span key={w} className="calendar__weekday">{w}</span>
          ))}
          {cells.map((cellDate, index) => {
            if (!cellDate) return <span key={`empty-${index}`} className="calendar__cell calendar__cell--empty" />
            const iso = toISO(cellDate)
            const data = days[iso]
            const classes = ['calendar__cell']
            if (iso === todayISO) classes.push('calendar__cell--today')
            if (iso === selected) classes.push('calendar__cell--selected')
            return (
              <button key={iso} type="button" className={classes.join(' ')} onClick={() => setSelected(iso)}>
                <span className="calendar__cell-num">{cellDate.getDate()}</span>
                <span className="calendar__cell-dots">
                  {data?.workouts?.length ? <i className="calendar__dot calendar__dot--workout" /> : null}
                  {data?.water ? <i className="calendar__dot calendar__dot--water" /> : null}
                  {data?.weight != null ? <i className="calendar__dot calendar__dot--weight" /> : null}
                </span>
              </button>
            )
          })}
        </div>

        {selectedInMonth ? (
          <div className="calendar__day">
            <h3 className="calendar__day-title">{selectedTitle}</h3>

            {hasSelectedData ? (
              <div className="calendar__day-rows">
                {(selectedData.workouts || []).map((workout, index) => (
                  <div key={`${workout.title}-${index}`} className="calendar__day-row">
                    <FaDumbbell className="calendar__day-icon calendar__day-icon--workout" aria-hidden="true" />
                    <span className="calendar__day-label">{workout.title}</span>
                    <strong className="calendar__day-value">
                      {workout.minutes ? t('calendar.minutes', { min: workout.minutes }) : ''}
                      {workout.minutes && workout.calories ? ' · ' : ''}
                      {workout.calories ? `${workout.calories} ${t('home.kcal')}` : ''}
                    </strong>
                  </div>
                ))}

                {selectedData.water ? (
                  <div className="calendar__day-row">
                    <FaDroplet className="calendar__day-icon calendar__day-icon--water" aria-hidden="true" />
                    <span className="calendar__day-label">{t('nutrition.water')}</span>
                    <strong className="calendar__day-value">
                      {u.fmtWater(selectedData.water.current, selectedData.water.target)}
                    </strong>
                  </div>
                ) : null}

                {selectedData.weight != null ? (
                  <div className="calendar__day-row">
                    <FaWeightScale className="calendar__day-icon calendar__day-icon--weight" aria-hidden="true" />
                    <span className="calendar__day-label">{t('home.statWeight')}</span>
                    <strong className="calendar__day-value">{u.fmtWeight(selectedData.weight)}</strong>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="calendar__day-empty">{t('calendar.empty')}</p>
            )}
          </div>
        ) : null}
      </div>
    </Modal>
  )
}

export default CalendarModal
