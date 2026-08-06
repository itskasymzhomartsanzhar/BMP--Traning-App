import { Navigate, useLocation } from 'react-router-dom'
import { useAppUI, isTelegramMiniApp } from '../../context/AppUIContext'

// Гостю доступны только эти маршруты; в мини-аппе гость — это только
// случай сломанного initData (ошибка конфигурации), не рабочий сценарий.
const GUEST_ROUTES = ['/landing', '/welcome', '/login', '/register']

// Экраны входа и регистрации: в мини-аппе не показываются никогда —
// вход там всегда автоматический, по initData.
const AUTH_ROUTES = ['/welcome', '/login', '/register']

function AuthGate({ children }) {
  const { authStatus, isOnboarded, userProfile } = useAppUI()
  const location = useLocation()
  const path = location.pathname
  const miniApp = isTelegramMiniApp()

  if (authStatus === 'loading') return null

  if (authStatus === 'guest') {
    if (GUEST_ROUTES.includes(path)) return children
    return <Navigate to="/landing" replace />
  }

  if (miniApp && AUTH_ROUTES.includes(path)) {
    return <Navigate to="/" replace />
  }

  // Браузер: авторизованных с guest-маршрутов уводят сами страницы —
  // RegisterPage навигирует в тренировку после создания аккаунта, и
  // редирект отсюда перехватил бы этот переход (гонка).
  if (GUEST_ROUTES.includes(path)) {
    return children
  }

  // Анкета не пройдена. В мини-аппе первичное открытие начинается
  // с лендинга (его кнопка ведёт в опрос), в браузере — сразу опрос.
  if (!isOnboarded && path !== '/onboarding') {
    return <Navigate to={miniApp ? '/landing' : '/onboarding'} replace />
  }

  // Бесплатного тарифа нет: после анкеты без активной подписки
  // доступен только пейволл.
  if (isOnboarded && !userProfile?.is_premium && path !== '/premium') {
    return <Navigate to="/premium" replace />
  }

  return children
}

export default AuthGate
