import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { isTelegramMiniApp } from '../../context/AppUIContext'

/**
 * Нативная кнопка «Назад» Telegram Mini App.
 *
 * На главных страницах (Главная, Тренировки, Аналитика, Профиль) и точках
 * входа кнопка скрыта, на остальных — видна и ведёт на логичного родителя,
 * а не по истории браузера: из упражнения и плана сессии — к программе,
 * из программы — к списку тренировок. В обычном браузере компонент ничего
 * не делает — остаются внутренние кнопки навигации.
 */

// Куда ведёт «Назад» с каждой страницы; null — кнопка скрыта.
function backTargetFor(pathname) {
  // Специфичные маршруты — раньше общих.
  const flow = pathname.match(/^\/trainings\/([^/]+)\/(session|exercise\/[^/]+)$/)
  if (flow) return `/trainings/${flow[1]}`
  if (/^\/trainings\/[^/]+\/complete$/.test(pathname)) return '/trainings'
  if (/^\/trainings\/[^/]+$/.test(pathname)) return '/trainings'
  if (pathname.startsWith('/article/')) return '/knowledge'
  if (pathname === '/nutrition' || pathname === '/knowledge') return '/profile'
  if (pathname === '/login' || pathname === '/register') return '/welcome'
  // Главные страницы, welcome, onboarding (свои шаги), landing — без кнопки.
  return null
}

function TelegramBackButton() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isTelegramMiniApp()) return undefined
    const back = window.Telegram?.WebApp?.BackButton
    if (!back) return undefined

    const target = backTargetFor(location.pathname)
    if (!target) {
      back.hide()
      return undefined
    }

    const handleBack = () => navigate(target)
    back.onClick(handleBack)
    back.show()
    // Снимаем именно свой обработчик — при смене страницы повесится новый.
    return () => back.offClick(handleBack)
  }, [location.pathname, navigate])

  return null
}

export default TelegramBackButton
