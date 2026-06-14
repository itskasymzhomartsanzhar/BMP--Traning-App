import { FaFireFlameSimple, FaPlay } from 'react-icons/fa6'

function FeaturedProgramCard({ data, onAction }) {
  return (
    <article className={`featured-training card animate-in delay-2 ${data.tone}`}>
      <div className="featured-training__content">
        <h2>{data.title}</h2>
        <p>{data.subtitle}</p>
      </div>

      <div className="featured-training__meta">
        <button type="button" className="meta-pill" onClick={() => onAction(`Длительность: ${data.duration}`)}>
          <FaPlay aria-hidden="true" />
          <span>{data.duration}</span>
        </button>

        <button type="button" className="meta-pill" onClick={() => onAction(`Расход: ${data.calories}`)}>
          <FaFireFlameSimple aria-hidden="true" />
          <span>{data.calories}</span>
        </button>
      </div>
    </article>
  )
}

export default FeaturedProgramCard
