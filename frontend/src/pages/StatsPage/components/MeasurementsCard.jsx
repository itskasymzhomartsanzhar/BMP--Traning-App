function MeasurementsCard({ measurements, onEdit }) {
  const hasData = measurements.length > 0

  return (
    <div className="card params-card animate-in delay-2">
      <div className="params-card__head">
        <h2>Параметры</h2>
        {hasData && (
          <button type="button" className="ghost" onClick={() => onEdit(measurements[0])} aria-label="Изменить замеры">
            ✎
          </button>
        )}
      </div>
      {hasData ? (
        <div className="params-grid">
          {measurements.map((item) => (
            <button type="button" key={item.label} className="param-row" onClick={() => onEdit(item)}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </button>
          ))}
        </div>
      ) : (
        <p className="params-card__empty">
          Замеров пока нет. Добавьте первый — и здесь появится ваша динамика.
        </p>
      )}
    </div>
  )
}

export default MeasurementsCard
