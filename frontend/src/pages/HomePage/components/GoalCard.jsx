import { FaPen } from 'react-icons/fa6'

function GoalCard({ goal, onEdit, onDayClick }) {
  return (
    <div className="weekly-goal card animate-in delay-1">
      <div className="weekly-goal__top">
        <strong>{goal.title}</strong>

        <button type="button" className="weekly-goal__counter" onClick={onEdit}>
          <span className="weekly-goal__value">
            {goal.completed}/{goal.target}
          </span>
          <FaPen className="weekly-goal__edit" aria-hidden="true" />
        </button>
      </div>

      <div className="weekly-goal__days">
        {goal.days.map((day) => (
          <button
            key={day.id}
            type="button"
            className={`goal-day ${day.state === 'active' ? 'is-active' : day.state === 'done' ? 'is-done' : ''}`}
            onClick={() => onDayClick(day)}
          >
            <span className="goal-day__label">{day.label}</span>
            <strong className="goal-day__date">{day.date}</strong>
          </button>
        ))}
      </div>
    </div>
  )
}

export default GoalCard
