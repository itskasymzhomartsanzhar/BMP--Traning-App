import { FaArrowLeft } from 'react-icons/fa6'
import './BackHeader.scss'

function BackHeader({ title, subtitle, onBack }) {
  return (
    <header className="back-header">
      <button type="button" className="back-header__btn" onClick={onBack} aria-label="Назад">
        <FaArrowLeft />
      </button>
      <div className="back-header__text">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </header>
  )
}

export default BackHeader
