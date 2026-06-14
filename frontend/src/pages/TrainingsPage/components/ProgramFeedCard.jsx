import { FaArrowUpRightFromSquare } from 'react-icons/fa6'

function ProgramFeedCard({ program, onClick }) {
  return (
    <button type="button" className={`training-program-card ${program.tone}`} onClick={onClick}>
      <span className="training-program-card__arrow">
        <FaArrowUpRightFromSquare aria-hidden="true" />
      </span>
      <span className="training-program-card__label">{program.tag}</span>
      <h3>{program.title}</h3>
      <p>{program.description}</p>
      <div className="training-program-card__meta">
        <strong>{program.duration}</strong>
        <span>{program.intensity}</span>
      </div>
    </button>
  )
}

export default ProgramFeedCard
