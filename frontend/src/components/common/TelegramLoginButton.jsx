/* eslint-disable react-refresh/only-export-components -- флаг конфигурации неотделим от кнопки */
import { useEffect, useRef } from 'react'

const BOT_USERNAME = import.meta.env.VITE_TG_BOT_USERNAME || ''

let callbackCounter = 0

/**
 * Официальный Telegram Login Widget (для сайта, не мини-аппа).
 * Работает только когда у бота через BotFather (/setdomain) привязан домен
 * и в .env задан VITE_TG_BOT_USERNAME. Без этого рендерит null —
 * родитель решает, что показать вместо кнопки.
 */
function TelegramLoginButton({ onAuth, size = 'large' }) {
  const containerRef = useRef(null)
  const onAuthRef = useRef(onAuth)

  useEffect(() => {
    onAuthRef.current = onAuth
  }, [onAuth])

  useEffect(() => {
    if (!BOT_USERNAME || !containerRef.current) return undefined

    const callbackName = `__tgAuthCb${callbackCounter += 1}`
    window[callbackName] = (user) => onAuthRef.current?.(user)

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-login', BOT_USERNAME)
    script.setAttribute('data-size', size)
    script.setAttribute('data-radius', '14')
    script.setAttribute('data-userpic', 'false')
    script.setAttribute('data-onauth', `${callbackName}(user)`)
    const container = containerRef.current
    container.appendChild(script)

    return () => {
      delete window[callbackName]
      container.replaceChildren()
    }
  }, [size])

  if (!BOT_USERNAME) return null

  return <div ref={containerRef} className="tg-login-widget" />
}

export const telegramWidgetConfigured = Boolean(BOT_USERNAME)

export default TelegramLoginButton
