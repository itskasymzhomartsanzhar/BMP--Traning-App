import { FaCrown, FaFireFlameSimple } from 'react-icons/fa6'

function TopStatus({ streak = 0, onStreakClick, onPremiumClick }) {
  return (
    <header className="top-status">
      <div className="top-status__title">TRES</div>

      <div className="top-status__actions">
        <button type="button" className="streak-button" aria-label="Серия тренировок" onClick={onStreakClick}>
          <FaFireFlameSimple aria-hidden="true" />
          <span className="streak-button__count">{streak}</span>
        </button>

        <button type="button" className="premium-button" aria-label="Premium" onClick={onPremiumClick}>
          <FaCrown aria-hidden="true" />
          <span>Premium</span>
        </button>
      </div>
    </header>
  )
}

export default TopStatus
