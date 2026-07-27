import { useState } from 'react'
import { FaXmark } from 'react-icons/fa6'
import { addMeasurement } from '../../../api/analytics'
import './MeasurementModal.scss'

// Обхваты сверху вниз по телу: шея, грудь, талия, бёдра.
const FIELDS = [
  { field: 'neck_cm', label: 'Шея', placeholder: '38' },
  { field: 'chest_cm', label: 'Грудь', placeholder: '100' },
  { field: 'waist_cm', label: 'Талия', placeholder: '82' },
  { field: 'hip_cm', label: 'Бёдра', placeholder: '96' },
]

function initialValues(current) {
  const list = Array.isArray(current) ? current : []
  const values = {}
  FIELDS.forEach(({ field }) => {
    const found = list.find((m) => m.field === field)
    const num = found ? parseFloat(String(found.value).replace(',', '.')) : NaN
    values[field] = Number.isFinite(num) ? String(num) : ''
  })
  return values
}

/**
 * Модалка замеров обхватов — все четыре инпута сразу, заполнены текущими
 * значениями. Один POST со всеми полями за сегодняшнюю дату.
 */
function MeasurementModal({ current = [], onClose, onSaved }) {
  const [values, setValues] = useState(() => initialValues(current))
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
      const num = Number(raw)
      if (!Number.isFinite(num) || num < 10 || num > 250) {
        setError('Проверьте значения — обхваты в сантиметрах (10–250).')
        return
      }
      payload[field] = Math.round(num)
      filled += 1
    }
    if (filled === 0) {
      setError('Заполните хотя бы один замер.')
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
        setError('Не удалось сохранить. Попробуйте ещё раз.')
        setSaving(false)
      })
  }

  return (
    <div className="meas-overlay" role="presentation" onClick={onClose}>
      <div className="card meas-sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="meas-head">
          <h2>Замеры тела</h2>
          <button type="button" className="meas-close" onClick={onClose} aria-label="Закрыть">
            <FaXmark />
          </button>
        </div>

        <p className="meas-hint">
          Обхваты в сантиметрах. Замеряйте утром натощак — так динамика точнее.
        </p>

        <div className="meas-fields">
          {FIELDS.map(({ field, label, placeholder }) => (
            <label key={field} className="meas-field">
              <span className="meas-field__label">{label}</span>
              <span className="meas-field__control">
                <input
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min="0"
                  placeholder={placeholder}
                  value={values[field]}
                  onChange={(e) => setField(field, e.target.value)}
                />
                <span className="meas-field__unit">см</span>
              </span>
            </label>
          ))}
        </div>

        {error && <p className="meas-error">{error}</p>}

        <div className="meas-actions">
          <button type="button" className="secondary" onClick={onClose} disabled={saving}>
            Отмена
          </button>
          <button type="button" className="primary" onClick={save} disabled={saving}>
            {saving ? 'Сохраняем…' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MeasurementModal
