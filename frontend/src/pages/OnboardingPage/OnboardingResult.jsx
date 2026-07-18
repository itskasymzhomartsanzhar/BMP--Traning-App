import { FaBolt, FaClock, FaFire } from 'react-icons/fa6'
import './OnboardingPage.scss'

const DAY_LABELS = {
  mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт', fri: 'Пт', sat: 'Сб', sun: 'Вс',
}

function OnboardingResult({ recommendation, userName, onStart, onSkip, startLabel = 'Начать тренировку', skipLabel = 'Позже, на главную' }) {
  const program = recommendation?.program
  const days = recommendation?.training_days ?? []

  return (
    <section className="onb onb--result">
      <div className="onb__bg" aria-hidden="true" />

      <div className="onb__body">
        <div className="onb-result__badge">Ваш план готов</div>
        <h1 className="onb__title">
          {userName ? `${userName}, начнём!` : 'Начнём!'}
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
            <p className="onb-plan__desc">
              Профиль сохранён. Программы появятся в разделе «Тренировки».
            </p>
          </div>
        )}

        {days.length > 0 && (
          <div className="onb-days">
            <p className="onb__label">Рекомендуемое расписание</p>
            <div className="onb-days__row">
              {Object.keys(DAY_LABELS).map((id) => (
                <span
                  key={id}
                  className={`onb-days__day${days.includes(id) ? ' is-on' : ''}`}
                >
                  {DAY_LABELS[id]}
                </span>
              ))}
            </div>
            <p className="onb__hint">Расписание можно поменять в любой момент на главной.</p>
          </div>
        )}
      </div>

      <footer className="onb__foot">
        {program && (
          <button type="button" className="onb__next" onClick={onStart}>
            {startLabel}
          </button>
        )}
        {onSkip && (
          <button type="button" className="onb__skip" onClick={onSkip}>
            {skipLabel}
          </button>
        )}
      </footer>
    </section>
  )
}

export default OnboardingResult
