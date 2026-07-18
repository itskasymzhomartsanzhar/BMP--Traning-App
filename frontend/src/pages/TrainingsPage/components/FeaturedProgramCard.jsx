import { FaFireFlameSimple, FaPlay } from 'react-icons/fa6'

function FeaturedProgramCard({ data, onOpen }) {
  return (
    <article className={`featured-training card animate-in delay-2 ${data.tone}`}>
      <button type="button" className="featured-training__open" onClick={onOpen}>
        <div className="featured-training__content">
          <h2>{data.title}</h2>
          <p>{data.subtitle}</p>
        </div>
      </button>

      <div className="featured-training__meta">
        <span className="meta-pill">
          <FaPlay aria-hidden="true" />
          <span>{data.duration}</span>
        </span>

        <span className="meta-pill">
          <FaFireFlameSimple aria-hidden="true" />
          <span>{data.calories}</span>
        </span>
      </div>
    </article>
  )
}

export default FeaturedProgramCard
