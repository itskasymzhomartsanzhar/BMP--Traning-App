function MeasurementsCard({ measurements, onEdit }) {
  const hasData = measurements.length > 0

  return (
    <div className="card params-card animate-in delay-2">
      <div className="params-card__head">
        <h2>Параметры</h2>
        {hasData && (
          <button type="button" className="ghost" onClick={onEdit} aria-label="Изменить замеры">
            ✎
          </button>
        )}
      </div>
      {hasData ? (
        <div className="params-grid">
          {measurements.map((item) => (
            <div key={item.label} className="param-row">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      ) : (
        <>
          <p className="params-card__empty">
            Замеров пока нет. Добавьте первый — и здесь появится ваша динамика.
          </p>
          <button type="button" className="secondary" onClick={onEdit}>
            + Добавить замеры
          </button>
        </>
      )}
    </div>
  )
}

export default MeasurementsCard
