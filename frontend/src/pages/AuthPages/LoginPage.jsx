import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa6'
import { useAppUI } from '../../context/AppUIContext'
import TelegramLoginButton, { telegramWidgetConfigured } from '../../components/common/TelegramLoginButton'
import './AuthPages.scss'

function LoginPage() {
  const navigate = useNavigate()
  const { loginWithEmail, loginWithTelegramWidget, showToast, isAuthenticated } = useAppUI()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  const submit = (event) => {
    event.preventDefault()
    if (!email.trim() || !password) {
      setError('Заполните почту и пароль.')
      return
    }
    setSaving(true)
    setError('')
    loginWithEmail(email.trim(), password)
      .catch((err) => {
        setError(err.response?.data?.detail || 'Не удалось войти. Попробуйте ещё раз.')
      })
      .finally(() => setSaving(false))
  }

  return (
    <section className="auth-page">
      <div className="auth-page__bg" aria-hidden="true" />

      <div className="auth-page__content">
        <form className="auth-form" onSubmit={submit} noValidate>
          <div className="auth-form__head">
            <button type="button" className="auth-form__back" onClick={() => navigate('/welcome')} aria-label="Назад">
              <FaArrowLeft />
            </button>
          </div>

          <h1 className="auth-form__title">С возвращением</h1>
          <p className="auth-form__subtitle">Войдите, чтобы продолжить тренировки.</p>

          <div className="auth-form__fields">
            <label className="auth-form__field">
              Почта
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(error)}
              />
            </label>

            <label className="auth-form__field">
              Пароль
              <input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(error)}
              />
            </label>

            {error && <span className="auth-form__error">{error}</span>}
          </div>

          <div className="auth-form__foot">
            <button type="submit" className="auth-actions__primary" disabled={saving}>
              {saving ? 'Входим…' : 'Войти'}
            </button>

            {telegramWidgetConfigured && (
              <>
                <div className="auth-divider">или</div>
                <TelegramLoginButton
                  onAuth={(user) =>
                    loginWithTelegramWidget(user).catch((err) =>
                      showToast(err.response?.data?.detail || 'Не удалось войти через Telegram'))
                  }
                  onError={(err) => {
                    if (['Telegram login was cancelled', 'popup_closed'].includes(String(err?.message))) return
                    showToast('Вход через Telegram не завершился. Попробуйте ещё раз.')
                  }}
                />
              </>
            )}

            <p className="auth-form__switch">
              Нет аккаунта?{' '}
              <button type="button" onClick={() => navigate('/register')}>Создать</button>
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}

export default LoginPage
