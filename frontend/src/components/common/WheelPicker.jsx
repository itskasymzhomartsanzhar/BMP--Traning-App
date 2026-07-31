import { useEffect, useRef } from 'react'
import './WheelPicker.scss'

const ITEM_HEIGHT = 40

/**
 * Барабан выбора, как в будильнике: значения крутятся прокруткой,
 * выбранное — то, что остановилось по центру (scroll-snap).
 *
 * options: [{ id, label }], value: id, onChange(id)
 */
function WheelPicker({ options, value, onChange }) {
  const listRef = useRef(null)
  const settleTimer = useRef(null)
  const suppressScroll = useRef(false)

  // Прокручиваем к текущему значению при открытии и внешней смене value.
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const index = Math.max(0, options.findIndex((o) => o.id === value))
    const target = index * ITEM_HEIGHT
    if (Math.abs(list.scrollTop - target) > 1) {
      suppressScroll.current = true
      list.scrollTop = target
      // Даём scroll-событию от программной прокрутки пройти мимо обработчика.
      window.setTimeout(() => { suppressScroll.current = false }, 80)
    }
  }, [options, value])

  useEffect(() => () => window.clearTimeout(settleTimer.current), [])

  const handleScroll = () => {
    if (suppressScroll.current) return
    window.clearTimeout(settleTimer.current)
    // Ждём, пока барабан остановится (snap довернёт до ближайшего пункта).
    settleTimer.current = window.setTimeout(() => {
      const list = listRef.current
      if (!list) return
      const index = Math.min(
        options.length - 1,
        Math.max(0, Math.round(list.scrollTop / ITEM_HEIGHT)),
      )
      const picked = options[index]
      if (picked && picked.id !== value) onChange(picked.id)
    }, 120)
  }

  const pick = (id, index) => {
    listRef.current?.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' })
    if (id !== value) onChange(id)
  }

  return (
    <div className="wheel" role="listbox" aria-activedescendant={`wheel-${value}`}>
      <div className="wheel__highlight" aria-hidden="true" />
      <div className="wheel__list" ref={listRef} onScroll={handleScroll}>
        {options.map((option, index) => (
          <button
            key={option.id}
            id={`wheel-${option.id}`}
            type="button"
            role="option"
            aria-selected={option.id === value}
            className={`wheel__item${option.id === value ? ' is-active' : ''}`}
            onClick={() => pick(option.id, index)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default WheelPicker
