function HomeStatsGrid({ stats, onStatClick }) {
  return (
    <div className="stats-grid animate-in delay-2">
      {stats.map((item) => (
        <button type="button" key={item.label} className="stat-card" onClick={() => onStatClick(item)}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </button>
      ))}
    </div>
  )
}

export default HomeStatsGrid
