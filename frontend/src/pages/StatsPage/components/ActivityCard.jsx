function ActivityCard({ items, onAction }) {
  return (
    <div className="card activity-card animate-in delay-3">
      <h2>Активность по дням</h2>
      <div className="bars">
        {items.map((item) => (
          <button
            key={item.day}
            type="button"
            className="bar-item"
            onClick={() => onAction(`${item.day}: ${item.value} активности`)}
          >
            <span className="bar" style={{ height: `${item.value * 22}px` }}></span>
            <small>{item.day}</small>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ActivityCard
