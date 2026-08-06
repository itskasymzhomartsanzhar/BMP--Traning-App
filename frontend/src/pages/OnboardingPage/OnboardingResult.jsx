import { FaBolt, FaClock, FaFire } from 'react-icons/fa6'
import { useAppUI } from '../../context/AppUIContext'
import './OnboardingPage.scss'

const DAY_IDS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

function OnboardingResult({ recommendation, userName, onStart, onSkip, startLabel = null, skipLabel = null }) {
  const { t } = useAppUI()
  const weekdays = t('calendar.weekdays').split(',')
  const program = recommendation?.program
  const days = recommendation?.training_days ?? []

  return (
    <section className="onb onb--result">
      <div className="onb__bg" aria-hidden="true" />

      <div className="onb__body">
        <div className="onb-result__badge">{t('onb.planReady')}</div>
        <h1 className="onb__title">
          {userName ? t('onb.letsGo', { name: userName }) : t('onb.letsGoNoName')}
        </h1>
        {recommendation?.reason && (
          <p className="onb__subtitle">{recommendation.reason}</p>
        )}

        {program ? (
          <div className="onb-plan">
            <h2 className="onb-plan__title">{program.title}</h2>
            <p className="onb-plan__desc">{program.description}</p>

            {/* Сериализатор отдаёт duration/calories уже с единицами измерения. */}
            <div className="onb-plan__meta">
              {program.duration && (
                <span className="onb-plan__meta-item">
                  <FaClock aria-hidden="true" /> {program.duration}
                </span>
              )}
              {program.calories && (
                <span className="onb-plan__meta-item">
                  <FaFire aria-hidden="true" /> {program.calories}
                </span>
              )}
              {program.intensity && (
                <span className="onb-plan__meta-item">
                  <FaBolt aria-hidden="true" /> {program.intensity}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="onb-plan">
            <p className="onb-plan__desc">{t('onb.profileSaved')}</p>
          </div>
        )}

        {days.length > 0 && (
          <div className="onb-days">
            <p className="onb__label">{t('onb.schedule')}</p>
            <div className="onb-days__row">
              {DAY_IDS.map((id, index) => (
                <span
                  key={id}
                  className={`onb-days__day${days.includes(id) ? ' is-on' : ''}`}
                >
                  {weekdays[index]}
                </span>
              ))}
            </div>
            <p className="onb__hint">{t('onb.scheduleHint')}</p>
          </div>
        )}
      </div>

      <footer className="onb__foot">
        {program && (
          <button type="button" className="onb__next" onClick={onStart}>
            {startLabel || t('home.startWorkout')}
          </button>
        )}
        {onSkip && (
          <button type="button" className="onb__skip" onClick={onSkip}>
            {skipLabel || t('onb.later')}
          </button>
        )}
      </footer>
    </section>
  )
}

export default OnboardingResult
