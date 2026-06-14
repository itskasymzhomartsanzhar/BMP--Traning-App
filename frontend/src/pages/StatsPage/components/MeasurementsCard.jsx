function MeasurementsCard({ measurements, onAction }) {
  return (
    <div className="card params-card animate-in delay-2">
      <h2>Параметры</h2>
      <div className="params-grid">
        {measurements.map((item) => (
          <button type="button" key={item.label} className="param-row" onClick={() => onAction(`${item.label}: ${item.value}`)}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </button>
        ))}
      </div>
    </div>
  )
}

export default MeasurementsCard
