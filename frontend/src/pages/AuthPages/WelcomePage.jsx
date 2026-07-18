import { Navigate, useNavigate } from 'react-router-dom'
import { FaDumbbell, FaBowlFood, FaChartLine } from 'react-icons/fa6'
import { useAppUI } from '../../context/AppUIContext'
import TelegramLoginButton, { telegramWidgetConfigured } from '../../components/common/TelegramLoginButton'
import './AuthPages.scss'

function WelcomePage() {
  const navigate = useNavigate()
  const { loginWithTelegramWidget, showToast, devLogin, isAuthenticated } = useAppUI()

  if (isAuthenticated) return <Navigate to="/" replace />

  const handleTelegramAuth = (widgetUser) => {
    loginWithTelegramWidget(widgetUser).catch(() =>
      showToast('Не удалось войти через Telegram'),
    )
  }

  return (
    <section className="auth-page">
      <div className="auth-page__bg" aria-hidden="true" />

      <div className="auth-page__content">
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
              <span>Питание и рецепты</span>
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
              <TelegramLoginButton onAuth={handleTelegramAuth} />
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
