import { Navigate, useLocation } from 'react-router-dom'
import { useAppUI } from '../../context/AppUIContext'

// Гостю доступны только эти маршруты; в мини-аппе они не нужны —
// там автовход по initData и сразу опрос.
const GUEST_ROUTES = ['/landing', '/welcome', '/login', '/register']

function AuthGate({ children }) {
  const { authStatus, isOnboarded } = useAppUI()
  const location = useLocation()
  const path = location.pathname

  if (authStatus === 'loading') return null

  if (authStatus === 'guest') {
    if (GUEST_ROUTES.includes(path)) return children
    return <Navigate to="/landing" replace />
  }

  // Авторизованных с guest-маршрутов уводят сами страницы: RegisterPage
  // навигирует в тренировку после создания аккаунта, и редирект отсюда
  // перехватил бы этот переход (гонка).
  if (GUEST_ROUTES.includes(path)) {
    return children
  }

  // Анкету не прошёл (вход через мини-апп или виджет) — сначала опрос.
  if (!isOnboarded && path !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

export default AuthGate
