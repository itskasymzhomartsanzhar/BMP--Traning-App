import { FaChartLine, FaDumbbell, FaHouse, FaRegUser } from 'react-icons/fa6'

const ICON_BY_KEY = {
  home: FaHouse,
  trainings: FaDumbbell,
  analytics: FaChartLine,
  profile: FaRegUser,
}

function BottomNav({ items, activePage, onChange }) {
  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const NavIcon = ICON_BY_KEY[item.key]

        return (
          <button
            key={item.key}
            type="button"
            className={activePage === item.key ? 'nav-item is-active' : 'nav-item'}
            onClick={() => onChange(item)}
          >
            {NavIcon ? <NavIcon aria-hidden="true" /> : null}
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNav
