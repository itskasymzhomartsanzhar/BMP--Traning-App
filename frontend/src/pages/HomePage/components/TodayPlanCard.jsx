import Icon from '../../../components/common/Icon'

function TodayPlanCard({ title = 'План на сегодня', items, showStart = true, emptyText = 'Планов нет', onStart, onItemClick }) {
  return (
    <div className="plan card animate-in delay-3">
      <h2>{title}</h2>
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
        <p className="plan__empty">{emptyText}</p>
      )}
      {showStart && (
        <button type="button" className="primary" onClick={onStart}>
          Начать тренировку
        </button>
      )}
    </div>
  )
}

export default TodayPlanCard
