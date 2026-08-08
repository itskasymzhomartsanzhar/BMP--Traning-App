import { useState } from 'react'
import { FaXmark } from 'react-icons/fa6'
import { addMeasurement } from '../../../api/analytics'
import { useAppUI } from '../../../context/AppUIContext'
import './MeasurementModal.scss'

// Обхваты сверху вниз по телу: шея, грудь, рука, талия, бёдра.
const FIELDS = [
  { field: 'neck_cm', labelKey: 'stats.neck', placeholder: '38' },
  { field: 'chest_cm', labelKey: 'stats.chest', placeholder: '100' },
  { field: 'arm_cm', labelKey: 'stats.arm', placeholder: '35' },
  { field: 'waist_cm', labelKey: 'stats.waist', placeholder: '82' },
  { field: 'hip_cm', labelKey: 'stats.hips', placeholder: '96' },
]

// Бэкенд хранит сантиметры — в форме показываем выбранную систему.
function initialValues(current, u) {
  const list = Array.isArray(current) ? current : []
  const values = {}
  FIELDS.forEach(({ field }) => {
    const found = list.find((m) => m.field === field)
    const num = found ? parseFloat(String(found.value).replace(',', '.')) : NaN
    values[field] = Number.isFinite(num) ? String(u.length(num)) : ''
  })
  return values
}

/**
 * Модалка замеров обхватов — все четыре инпута сразу, заполнены текущими
 * значениями. Один POST со всеми полями за сегодняшнюю дату.
 */
function MeasurementModal({ current = [], onClose, onSaved }) {
  const { t, u } = useAppUI()
  const [values, setValues] = useState(() => initialValues(current, u))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const setField = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const save = () => {
    const payload = { recorded_at: new Date().toISOString().slice(0, 10) }
    let filled = 0
    for (const { field } of FIELDS) {
      const raw = String(values[field]).replace(',', '.').trim()
      if (raw === '') continue
      // Ввод в выбранной системе, в API — всегда сантиметры.
      const cm = u.lengthToCm(Number(raw))
      if (!Number.isFinite(cm) || cm < 10 || cm > 250) {
        setError(t('stats.measureRangeError', { unit: u.lengthLabel, min: u.length(10), max: u.length(250) }))
        return
      }
      payload[field] = Math.round(cm)
      filled += 1
    }
    if (filled === 0) {
      setError(t('stats.measureEmptyError'))
      return
    }
    setSaving(true)
    setError('')
    addMeasurement(payload)
      .then(({ data }) => {
        onSaved(data ?? [])
        onClose()
      })
      .catch(() => {
        setError(t('stats.measureSaveError'))
        setSaving(false)
      })
  }

  return (
    <div className="meas-overlay" role="presentation" onClick={onClose}>
      <div className="card meas-sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="meas-head">
          <h2>{t('stats.bodyMeasurements')}</h2>
          <button type="button" className="meas-close" onClick={onClose} aria-label="Закрыть">
            <FaXmark />
          </button>
        </div>

        <p className="meas-hint">{t('stats.measureHint', { unit: u.lengthLabel })}</p>

        <div className="meas-fields">
          {FIELDS.map(({ field, labelKey, placeholder }) => (
            <label key={field} className="meas-field">
              <span className="meas-field__label">{t(labelKey)}</span>
              <span className="meas-field__control">
                <input
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min="0"
                  placeholder={String(u.length(placeholder))}
                  value={values[field]}
                  onChange={(e) => setField(field, e.target.value)}
                />
                <span className="meas-field__unit">{u.lengthLabel}</span>
              </span>
            </label>
          ))}
        </div>

        {error && <p className="meas-error">{error}</p>}

        <div className="meas-actions">
          <button type="button" className="secondary" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </button>
          <button type="button" className="primary" onClick={save} disabled={saving}>
            {saving ? t('stats.saving') : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MeasurementModal
