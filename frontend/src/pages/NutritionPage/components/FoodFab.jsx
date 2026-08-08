import { useState } from 'react'
import { FaBarcode, FaCamera, FaMagnifyingGlass, FaMicrophone, FaPlus } from 'react-icons/fa6'
import { useAppUI } from '../../../context/AppUIContext'

/* Плавающая кнопка добавления еды: раскрывается в четыре способа ввода. */
function FoodFab({ onPhoto, onVoice, onBarcode, onSearch }) {
  const { t } = useAppUI()
  const [open, setOpen] = useState(false)

  const actions = [
    { key: 'search', icon: <FaMagnifyingGlass />, label: t('food.addSearch'), onClick: onSearch },
    { key: 'barcode', icon: <FaBarcode />, label: t('food.addBarcode'), onClick: onBarcode },
    { key: 'voice', icon: <FaMicrophone />, label: t('food.addVoice'), onClick: onVoice },
    { key: 'photo', icon: <FaCamera />, label: t('food.addPhoto'), onClick: onPhoto },
  ]

  return (
    <>
      {open && <div className="food-fab-backdrop" role="presentation" onClick={() => setOpen(false)} />}
      <div className={`food-fab${open ? ' food-fab--open' : ''}`}>
        {open && (
          <div className="food-fab__actions">
            {actions.map((action) => (
              <button
                key={action.key}
                type="button"
                className="food-fab__action"
                onClick={() => {
                  setOpen(false)
                  action.onClick()
                }}
              >
                <span className="food-fab__action-label">{action.label}</span>
                <span className="food-fab__action-icon">{action.icon}</span>
              </button>
            ))}
          </div>
        )}
        {/*<button
          type="button"
          className="food-fab__main"
          aria-label={t('food.addTitle')}
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <FaPlus aria-hidden="true" />
        </button>*/}
      </div>
    </>
  )
}

export default FoodFab
