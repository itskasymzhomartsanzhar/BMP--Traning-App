import { FaFireFlameSimple, FaRegCalendarDays } from 'react-icons/fa6'
import logoMark from '../../assets/logo-mark.png'

function TopStatus({ streak = 0, onStreakClick, onCalendarClick }) {
  return (
    <header className="top-status">
      <div className="top-status__title">
        <img className="top-status__logo" src={logoMark} alt="" aria-hidden="true" />
        TRES
      </div>

      <div className="top-status__actions">
        <button type="button" className="streak-button" aria-label="Серия тренировок" onClick={onStreakClick}>
          <FaFireFlameSimple aria-hidden="true" />
          <span className="streak-button__count">{streak}</span>
        </button>

        <button type="button" className="calendar-button" aria-label="Календарь" onClick={onCalendarClick}>
          <FaRegCalendarDays aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}

export default TopStatus
