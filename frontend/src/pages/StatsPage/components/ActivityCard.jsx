import { useAppUI } from '../../../context/AppUIContext'

/**
 * Столбик дня — из двух равных половин: нижняя за завершённую тренировку,
 * верхняя за питание (цель по воде). Обе есть — столбик полный.
 */
function ActivityCard({ items, onDayClick }) {
  const { t } = useAppUI()
  return (
    <div className="card activity-card animate-in delay-3">
      <h2>{t('stats.activityByDay')}</h2>
      <div className="bars">
        {items.map((item) => (
          <button
            key={item.day}
            type="button"
            className="bar-item"
            onClick={() => onDayClick?.(item)}
          >
            <span className="bar-track">
              {item.nutrition_done ? <i className="bar-seg bar-seg--nutrition" /> : null}
              {item.workout_done ? <i className="bar-seg bar-seg--workout" /> : null}
            </span>
            <small>{item.day}</small>
          </button>
        ))}
      </div>
      <div className="activity-legend">
        <span><i className="legend-dot legend-dot--workout" />{t('stats.legendWorkout')}</span>
        <span><i className="legend-dot legend-dot--nutrition" />{t('stats.legendNutrition')}</span>
      </div>
    </div>
  )
}

export default ActivityCard
