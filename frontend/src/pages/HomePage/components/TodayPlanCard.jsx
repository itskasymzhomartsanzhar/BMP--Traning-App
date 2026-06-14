import Icon from '../../../components/common/Icon'

function TodayPlanCard({ items, onStart }) {
  return (
    <div className="plan card animate-in delay-3">
      <h2>План на сегодня</h2>
      <ul>
        {items.map((item) => (
          <li key={item.title}>
            <span className="plan-icon">
              <Icon name="task" />
            </span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.subtitle}</p>
            </div>
          </li>
        ))}
      </ul>
      <button type="button" className="primary" onClick={onStart}>
        Начать тренировку
      </button>
    </div>
  )
}

export default TodayPlanCard
