/* eslint-disable react-refresh/only-export-components -- флаг конфигурации неотделим от кнопки */
import { useEffect, useRef, useState } from 'react'
import { FaTelegram } from 'react-icons/fa6'
import './TelegramLoginButton.scss'

const LOGIN_CLIENT_ID = import.meta.env.VITE_TG_LOGIN_CLIENT_ID || ''

const SDK_SCRIPT_ID = 'telegram-login-sdk'
const SDK_SCRIPT_SRC = 'https://oauth.telegram.org/js/telegram-login.js?5'
const LOGIN_SCOPES = ['profile', 'write']
const LOGIN_TIMEOUT_MS = 120000

const getLoginLanguage = () => {
  const language = String(localStorage.getItem('appLanguage') || navigator.language || 'ru').toLowerCase()
  if (language.startsWith('en')) return 'en'
  return 'ru'
}

const loadLoginSdk = () => new Promise((resolve, reject) => {
  const existingApi = window.Telegram?.Login
  if (existingApi?.auth) {
    resolve(existingApi)
    return
  }

  const finish = () => {
    const loadedApi = window.Telegram?.Login
    if (loadedApi?.auth) {
      resolve(loadedApi)
      return
    }
    reject(new Error('Telegram Login SDK is unavailable'))
  }

  const existingScript = document.getElementById(SDK_SCRIPT_ID)
    || document.querySelector(`script[src="${SDK_SCRIPT_SRC}"]`)

  if (existingScript) {
    let timeoutId = null
    const settle = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
        timeoutId = null
      }
      finish()
    }
    existingScript.addEventListener('load', settle, { once: true })
    existingScript.addEventListener('error', () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
        timeoutId = null
      }
      reject(new Error('Telegram Login SDK failed to load'))
    }, { once: true })
    if (existingScript.dataset.loaded === 'true') {
      window.setTimeout(settle, 0)
    } else {
      timeoutId = window.setTimeout(settle, 15000)
    }
    return
  }

  const script = document.createElement('script')
  script.id = SDK_SCRIPT_ID
  script.src = SDK_SCRIPT_SRC
  script.async = true
  script.onload = () => {
    script.dataset.loaded = 'true'
    finish()
  }
  script.onerror = () => reject(new Error('Telegram Login SDK failed to load'))
  document.head.appendChild(script)
})

const openSdkLogin = () => new Promise((resolve, reject) => {
  let settled = false
  let timeoutId = null

  const finish = (error, payload) => {
    if (settled) return
    settled = true
    if (timeoutId) {
      window.clearTimeout(timeoutId)
      timeoutId = null
    }
    if (error) {
      reject(error)
      return
    }
    resolve(payload)
  }

  timeoutId = window.setTimeout(() => finish(new Error('Telegram login timed out')), LOGIN_TIMEOUT_MS)

  loadLoginSdk()
    .then((loginApi) => {
      loginApi.auth({
        client_id: Number(LOGIN_CLIENT_ID),
        scope: LOGIN_SCOPES,
        lang: getLoginLanguage(),
      }, (data) => {
        if (!data) {
          finish(new Error('Telegram login was cancelled'))
          return
        }
        if (data.error) {
          finish(new Error(data.error_description || data.error))
          return
        }
        if (!data.id_token) {
          finish(new Error('Telegram login returned empty id_token'))
          return
        }
        finish(null, { id_token: data.id_token })
      })
    })
    .catch((error) => finish(error))
})

/**
 * Вход через новый Telegram Login SDK (telegram-login.js?5, OIDC).
 * Нужен VITE_TG_LOGIN_CLIENT_ID из настроек Web Login мини-аппа в BotFather
 * (My Bots → Bot Settings → Web Login; там же домен сайта в Allowed URLs).
 * Без него рендерит null — родитель решает, что показать вместо кнопки.
 * onAuth получает { id_token } — бэкенд проверяет его на /auth/telegram-widget/.
 */
function TelegramLoginButton({ onAuth, onError, children = 'Войти через Telegram' }) {
  const onAuthRef = useRef(onAuth)
  const onErrorRef = useRef(onError)
  const loadingRef = useRef(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    onAuthRef.current = onAuth
    onErrorRef.current = onError
  }, [onAuth, onError])

  const handleLogin = async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    try {
      const payload = await openSdkLogin()
      onAuthRef.current?.(payload)
    } catch (error) {
      onErrorRef.current?.(error)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }

  if (!LOGIN_CLIENT_ID) return null

  return (
    <button
      type="button"
      className={`tg-login-btn ${loading ? 'tg-login-btn--loading' : ''}`}
      onClick={handleLogin}
      disabled={loading}
    >
      <FaTelegram aria-hidden="true" />
      <span>{loading ? 'Входим...' : children}</span>
    </button>
  )
}

export const telegramWidgetConfigured = Boolean(LOGIN_CLIENT_ID)

export default TelegramLoginButton
