import { useAppUI } from '../../../context/AppUIContext'

const FIELD_KEYS = {
  neck_cm: 'stats.neck',
  chest_cm: 'stats.chest',
  waist_cm: 'stats.waist',
  hip_cm: 'stats.hips',
}

function MeasurementsCard({ measurements, onEdit }) {
  const { t } = useAppUI()
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
              <strong>{String(item.value).replace(' см', ` ${t('stats.cm')}`).replace(' кг', ` ${t('stats.kg')}`)}</strong>
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
