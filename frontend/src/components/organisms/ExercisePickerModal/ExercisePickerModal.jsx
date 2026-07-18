import { FaXmark, FaDumbbell } from 'react-icons/fa6'
import './ExercisePickerModal.scss'

function ExercisePickerModal({ currentId, exercises = [], onSelect, onClose }) {
  return (
    <div className="epicker-overlay" role="presentation" onClick={onClose}>
      <div
        className="epicker-sheet"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="epicker-sheet__close" onClick={onClose} aria-label="Закрыть">
          <FaXmark />
        </button>

        <h2 className="epicker-sheet__title">Заменить упражнение</h2>
        <p className="epicker-sheet__subtitle">Выберите альтернативное упражнение</p>

        <div className="epicker-list">
          {exercises.map((tpl) => {
            const isCurrent = tpl.slug === currentId
            return (
              <button
                key={tpl.slug}
                type="button"
                className={`epicker-item${isCurrent ? ' is-current' : ''}`}
                onClick={() => {
                  if (!isCurrent) onSelect(tpl.slug)
                }}
              >
                <div className="epicker-item__icon">
                  <FaDumbbell />
                </div>
                <div className="epicker-item__info">
                  <strong>{tpl.name}</strong>
                  <span>{tpl.muscle}</span>
                </div>
                {isCurrent && <span className="epicker-item__badge">Текущее</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ExercisePickerModal
