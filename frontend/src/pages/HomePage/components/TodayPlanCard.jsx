import Icon from '../../../components/common/Icon'
import { useAppUI } from '../../../context/AppUIContext'

function TodayPlanCard({ title, items, showStart = true, emptyText, onStart, onItemClick }) {
  const { t } = useAppUI()
  return (
    <div className="plan card animate-in delay-3">
      <h2>{title ?? t('home.planToday')}</h2>
      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={item.title}>
              <button type="button" className="plan-item-btn" onClick={() => onItemClick?.(item)}>
                <span className="plan-icon">
                  <Icon name="task" />
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.subtitle}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="plan__empty">{emptyText ?? t('home.noPlansToday')}</p>
      )}
      {showStart && (
        <button type="button" className="primary" onClick={onStart}>
          {t('home.startWorkout')}
        </button>
      )}
    </div>
  )
}

export default TodayPlanCard
