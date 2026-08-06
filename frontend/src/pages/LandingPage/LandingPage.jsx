import { Navigate, useNavigate } from 'react-router-dom'
import { useAppUI, isTelegramMiniApp } from '../../context/AppUIContext'
import personImg from '../../assets/person.webp'
import logoImg from '../../assets/logo-mark.png'
import './LandingPage.scss'

// Брендовый лендинг: первый экран для гостя в браузере и для нового
// пользователя мини-аппа (он уже авторизован по initData, но опрос не прошёл).
function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isOnboarded } = useAppUI()
  const miniApp = isTelegramMiniApp()

  if (isAuthenticated && (!miniApp || isOnboarded)) return <Navigate to="/" replace />

  return (
    <section className="landing">
      <div className="landing__glow" aria-hidden="true" />

      <div className="landing__hero">
        <h1 className="landing__brand" aria-label="TRES">TRES</h1>
        <img className="landing__person" src={personImg} alt="" fetchPriority="high" decoding="async" />
        <p className="landing__eco">FITNESS ECOSYSTEM</p>
      </div>

      <nav className="landing__menu">
        <button type="button" className="landing__item landing__item--active" onClick={() => navigate(miniApp ? '/onboarding' : '/welcome')}>
          TRAINING APP
        </button>
        <span className="landing__item landing__item--soon">
          SUPPS
          <small>SOON</small>
        </span>
        <span className="landing__item landing__item--soon">
          SPORT WEAR
          <small>SOON</small>
        </span>
      </nav>

      <footer className="landing__foot">
        <img className="landing__logo" src={logoImg} alt="TRES" />
        <span className="landing__logo-text">TRES</span>
      </footer>
    </section>
  )
}

export default LandingPage
