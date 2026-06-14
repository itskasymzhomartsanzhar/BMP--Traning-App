import { FaCrown, FaFireFlameSimple } from 'react-icons/fa6'

function TopStatus({ onStreakClick, onPremiumClick }) {
  return (
    <header className="top-status">
      <div className="top-status__title">BODY. MINDSET. <br/>PERFORMANCE.</div>

      <div className="top-status__actions">
        <button type="button" className="streak-button" aria-label="Серия тренировок" onClick={onStreakClick}>
          <FaFireFlameSimple aria-hidden="true" />
        </button>

        <button type="button" className="premium-button" aria-label="Купить Premium" onClick={onPremiumClick}>
          <FaCrown aria-hidden="true" />
          <span>Premium</span>
        </button>
      </div>
    </header>
  )
}

export default TopStatus
