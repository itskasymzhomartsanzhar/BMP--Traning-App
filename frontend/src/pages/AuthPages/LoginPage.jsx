import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa6'
import { useAppUI } from '../../context/AppUIContext'
import TelegramLoginButton, { telegramWidgetConfigured } from '../../components/common/TelegramLoginButton'
import './AuthPages.scss'

function LoginPage() {
  const navigate = useNavigate()
  const { loginWithEmail, loginWithTelegramWidget, showToast, isAuthenticated, t } = useAppUI()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  if (isAuthenticated) return <Navigate to="/" replace />

  const submit = (event) => {
    event.preventDefault()
    if (!email.trim() || !password) {
      setError(t('auth.fillBoth'))
      return
    }
    setSaving(true)
    setError('')
    loginWithEmail(email.trim(), password)
      .catch((err) => {
        setError(err.response?.data?.detail || t('auth.loginError'))
      })
      .finally(() => setSaving(false))
  }

  return (
    <section className="auth-page">
      <div className="auth-page__bg" aria-hidden="true" />

      <div className="auth-page__content">
        <form className="auth-form" onSubmit={submit} noValidate>
          <div className="auth-form__head">
            <button type="button" className="auth-form__back" onClick={() => navigate('/welcome')} aria-label={t('common.back')}>
              <FaArrowLeft />
            </button>
          </div>

          <h1 className="auth-form__title">{t('auth.welcomeBack')}</h1>
          <p className="auth-form__subtitle">{t('auth.welcomeBackSub')}</p>

          <div className="auth-form__fields">
            <label className="auth-form__field">
              {t('onb.email')}
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
              {t('onb.password')}
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
              {saving ? t('auth.signingIn') : t('auth.signIn')}
            </button>

            {telegramWidgetConfigured && (
              <>
                <div className="auth-divider">{t('auth.or')}</div>
                <TelegramLoginButton
                  onAuth={(user) =>
                    loginWithTelegramWidget(user).catch((err) =>
                      showToast(err.response?.data?.detail || t('auth.tgError')))
                  }
                  onError={(err) => {
                    if (['Telegram login was cancelled', 'popup_closed'].includes(String(err?.message))) return
                    showToast(t('auth.tgIncomplete'))
                  }}
                />
              </>
            )}

            <p className="auth-form__switch">
              {t('auth.noAccount')}{' '}
              <button type="button" onClick={() => navigate('/register')}>{t('auth.create')}</button>
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}

export default LoginPage
