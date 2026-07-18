import { useState } from 'react'
import { FaXmark, FaCheck } from 'react-icons/fa6'
import './TrainingDaysModal.scss'

const DAYS = [
  { id: 'mon', label: 'Пн' },
  { id: 'tue', label: 'Вт' },
  { id: 'wed', label: 'Ср' },
  { id: 'thu', label: 'Чт' },
  { id: 'fri', label: 'Пт' },
  { id: 'sat', label: 'Сб' },
  { id: 'sun', label: 'Вс' },
]

function TrainingDaysModal({ selectedDays, onSave, onClose }) {
  const [selected, setSelected] = useState(() => new Set(selectedDays))

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const count = selected.size

  return (
    <div className="tdays-overlay" role="presentation" onClick={onClose}>
      <div
        className="tdays-sheet"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="tdays-sheet__close" onClick={onClose} aria-label="Закрыть">
          <FaXmark />
        </button>

        <h2 className="tdays-sheet__title">Дни тренировок</h2>
        <p className="tdays-sheet__subtitle">
          Выбрано: <strong>{count}</strong> {count === 1 ? 'день' : count >= 2 && count <= 4 ? 'дня' : 'дней'} в неделю
        </p>

        <div className="tdays-grid">
          {DAYS.map((day) => {
            const active = selected.has(day.id)
            return (
              <button
                key={day.id}
                type="button"
                className={`tdays-day${active ? ' is-selected' : ''}`}
                onClick={() => toggle(day.id)}
              >
                <span className="tdays-day__label">{day.label}</span>
                {active && <FaCheck className="tdays-day__check" />}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          className="tdays-save"
          disabled={count === 0}
          onClick={() => onSave([...selected])}
        >
          Сохранить
        </button>
      </div>
    </div>
  )
}

export default TrainingDaysModal
