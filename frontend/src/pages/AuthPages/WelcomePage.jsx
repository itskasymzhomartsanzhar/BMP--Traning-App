import { Navigate, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaDumbbell, FaBowlFood, FaChartLine } from 'react-icons/fa6'
import { useAppUI } from '../../context/AppUIContext'
import TelegramLoginButton, { telegramWidgetConfigured } from '../../components/common/TelegramLoginButton'
import './AuthPages.scss'

function WelcomePage() {
  const navigate = useNavigate()
  const { loginWithTelegramWidget, showToast, devLogin, isAuthenticated } = useAppUI()

  if (isAuthenticated) return <Navigate to="/" replace />

  const handleTelegramAuth = (widgetUser) => {
    loginWithTelegramWidget(widgetUser).catch((err) =>
      showToast(err.response?.data?.detail || 'Не удалось войти через Telegram'),
    )
  }

  const handleTelegramError = (error) => {
    if (['Telegram login was cancelled', 'popup_closed'].includes(String(error?.message))) return
    showToast('Вход через Telegram не завершился. Попробуйте ещё раз.')
  }

  return (
    <section className="auth-page">
      <div className="auth-page__bg" aria-hidden="true" />

      <div className="auth-page__content">
        <div className="auth-form__head">
          <button type="button" className="auth-form__back" onClick={() => navigate('/landing')} aria-label="К лендингу">
            <FaArrowLeft />
          </button>
        </div>

        <div className="welcome__hero">
          <h1 className="welcome__brand">TRES</h1>
          <p className="welcome__tagline">
            Персональный план тренировок, питание и прогресс — в одном приложении.
          </p>

          <div className="welcome__features">
            <div className="welcome__feature">
              <FaDumbbell aria-hidden="true" />
              <span>План под вашу цель</span>
            </div>
            <div className="welcome__feature">
              <FaBowlFood aria-hidden="true" />
              <span>Питание и КБЖУ</span>
            </div>
            <div className="welcome__feature">
              <FaChartLine aria-hidden="true" />
              <span>Динамика и замеры</span>
            </div>
          </div>
        </div>

        <div className="auth-actions">
          <button type="button" className="auth-actions__primary" onClick={() => navigate('/register')}>
            Создать аккаунт
          </button>
          <button type="button" className="auth-actions__secondary" onClick={() => navigate('/login')}>
            Войти
          </button>

          {telegramWidgetConfigured && (
            <>
              <div className="auth-divider">или</div>
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
