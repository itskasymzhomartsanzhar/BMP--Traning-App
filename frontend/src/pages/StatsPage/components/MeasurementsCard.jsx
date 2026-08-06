import { useAppUI } from '../../../context/AppUIContext'

const FIELD_KEYS = {
  neck_cm: 'stats.neck',
  chest_cm: 'stats.chest',
  waist_cm: 'stats.waist',
  hip_cm: 'stats.hips',
}

// Бэкенд отдаёт значения строками в метрике («100 см», «97 кг», «19.3%») —
// парсим число и форматируем в выбранной системе измерения.
function formatValue(item, u) {
  const num = parseFloat(String(item.value).replace(',', '.'))
  if (!Number.isFinite(num)) return item.value
  if (item.field === 'body_fat_percent') return `${num}%`
  if (item.field === 'weight' || item.field === 'muscle_mass') return u.fmtWeight(num)
  if (String(item.field).endsWith('_cm')) return u.fmtLength(num)
  return item.value
}

function MeasurementsCard({ measurements, onEdit }) {
  const { t, u } = useAppUI()
  const hasData = measurements.length > 0

  return (
    <div className="card params-card animate-in delay-2">
      <div className="params-card__head">
        <h2>{t('stats.params')}</h2>
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
              <span>{FIELD_KEYS[item.field] ? t(FIELD_KEYS[item.field]) : item.label}</span>
              <strong>{formatValue(item, u)}</strong>
            </div>
          ))}
        </div>
      ) : (
        <>
          <p className="params-card__empty">{t('stats.noMeasurements')}</p>
          <button type="button" className="secondary" onClick={onEdit}>
            {t('stats.addMeasurements')}
          </button>
        </>
      )}
    </div>
  )
}

export default MeasurementsCard
