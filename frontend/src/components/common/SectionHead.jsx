import Icon from './Icon'

function SectionHead({ title, icon, onIconClick, iconMessage }) {
  return (
    <div className="section-head animate-in">
      <h3>{title}</h3>
      <button type="button" className="icon-button" onClick={onIconClick} aria-label={iconMessage || title}>
        <Icon name={icon} />
      </button>
    </div>
  )
}


export default SectionHead
