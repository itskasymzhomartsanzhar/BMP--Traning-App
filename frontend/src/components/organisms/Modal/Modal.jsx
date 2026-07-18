import { useEffect, useRef, useState } from 'react'
import './Modal.scss'

function Modal({ title, message, children, input, actions = [], onClose, className = '' }) {
  const [inputValue, setInputValue] = useState(input?.defaultValue ?? '')
  const inputRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (input) inputRef.current?.focus()
  }, [input])

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className={`modal card animate-in${className ? ` ${className}` : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-title">{title}</h2>
        {message ? <p className="modal__message">{message}</p> : null}
        {input ? (
          <input
            ref={inputRef}
            className="modal__input"
            type={input.type ?? 'text'}
            inputMode={input.inputMode ?? (input.type === 'number' ? 'decimal' : undefined)}
            step={input.step}
            placeholder={input.placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        ) : null}
        {children}
        {actions.length > 0 && (
          <div className="modal__actions">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                className={action.variant === 'secondary' ? 'secondary' : 'primary'}
                onClick={() => {
                  action.onClick?.(inputValue)
                  onClose()
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
