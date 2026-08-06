import { useAppUI } from '../../../context/AppUIContext'

function WeightChartCard({ points }) {
  const { t, u } = useAppUI()
  const width = 320
  const height = 180
  const padding = 14

  if (points.length === 0) {
    return (
      <div className="card chart-card animate-in delay-2">
        <h2>{t('stats.weightChart', { unit: u.weightLabel })}</h2>
        <p className="chart-card__empty">{t('stats.weightChartEmpty')}</p>
      </div>
    )
  }

  const values = points.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)

  const normalized = points.map((point, index) => {
    // При одной точке делить на (length - 1) нельзя — рисуем её по центру.
    const ratio = points.length === 1 ? 0.5 : index / (points.length - 1)
    const x = padding + ratio * (width - padding * 2)
    const y = padding + ((max - point.value) / (max - min || 1)) * (height - padding * 2)
    return { ...point, x, y }
  })

  const polyline = normalized.map((point) => `${point.x},${point.y}`).join(' ')

  return (
    <div className="card chart-card animate-in delay-2">
      <h2>{t('stats.weightChart', { unit: u.weightLabel })}</h2>

      <div className="chart-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="График изменения веса">
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#E8C98F" />
              <stop offset="100%" stopColor="#D4AF6A" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3].map((line) => (
            <line
              key={line}
              x1={padding}
              y1={padding + (line * (height - padding * 2)) / 3}
              x2={width - padding}
              y2={padding + (line * (height - padding * 2)) / 3}
              stroke="#423D34"
              strokeWidth="1"
            />
          ))}

          <polyline fill="none" stroke="url(#lineGradient)" strokeWidth="3" points={polyline} />

          {normalized.map((point) => (
            <g key={point.date}>
              <circle cx={point.x} cy={point.y} r="4" fill="#E8C98F" />
            </g>
          ))}
        </svg>

        <div className="chart-labels">
          {points.map((point) => (
            <span key={point.date}>{point.date}</span>
          ))}
        </div>

        <p className="chart-value">{t('stats.currentWeight', { value: u.fmtWeight(points[points.length - 1]?.value ?? 0) })}</p>
      </div>
    </div>
  )
}

export default WeightChartCard
