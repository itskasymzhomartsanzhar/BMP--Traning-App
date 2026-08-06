import { Navigate, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaDumbbell, FaBowlFood, FaChartLine } from 'react-icons/fa6'
import { useAppUI } from '../../context/AppUIContext'
import TelegramLoginButton, { telegramWidgetConfigured } from '../../components/common/TelegramLoginButton'
import './AuthPages.scss'

function WelcomePage() {
  const navigate = useNavigate()
  const { loginWithTelegramWidget, showToast, devLogin, isAuthenticated, t } = useAppUI()

  if (isAuthenticated) return <Navigate to="/" replace />

  const handleTelegramAuth = (widgetUser) => {
    loginWithTelegramWidget(widgetUser).catch((err) =>
      showToast(err.response?.data?.detail || t('auth.tgError')),
    )
  }

  const handleTelegramError = (error) => {
    if (['Telegram login was cancelled', 'popup_closed'].includes(String(error?.message))) return
    showToast(t('auth.tgIncomplete'))
  }

  return (
    <section className="auth-page">
      <div className="auth-page__bg" aria-hidden="true" />

      <div className="auth-page__content">
        <div className="auth-form__head">
          <button type="button" className="auth-form__back" onClick={() => navigate('/landing')} aria-label={t('common.back')}>
            <FaArrowLeft />
          </button>
        </div>

        <div className="welcome__hero">
          <h1 className="welcome__brand">TRES</h1>
          <p className="welcome__tagline">{t('auth.tagline')}</p>

          <div className="welcome__features">
            <div className="welcome__feature">
              <FaDumbbell aria-hidden="true" />
              <span>{t('auth.featPlan')}</span>
            </div>
            <div className="welcome__feature">
              <FaBowlFood aria-hidden="true" />
              <span>{t('auth.featNutrition')}</span>
            </div>
            <div className="welcome__feature">
              <FaChartLine aria-hidden="true" />
              <span>{t('auth.featProgress')}</span>
            </div>
          </div>
        </div>

        <div className="auth-actions">
          <button type="button" className="auth-actions__primary" onClick={() => navigate('/register')}>
            {t('auth.createAccount')}
          </button>
          <button type="button" className="auth-actions__secondary" onClick={() => navigate('/login')}>
            {t('auth.signIn')}
          </button>

          {telegramWidgetConfigured && (
            <>
              <div className="auth-divider">{t('auth.or')}</div>
              <TelegramLoginButton onAuth={handleTelegramAuth} onError={handleTelegramError} />
            </>
          )}

          {import.meta.env.DEV && (
            <button
              type="button"
              className="auth-dev-btn"
              onClick={() => devLogin().catch(() => showToast('Dev-вход недоступен'))}
            >
              Dev-вход (только локально)
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export default WelcomePage
