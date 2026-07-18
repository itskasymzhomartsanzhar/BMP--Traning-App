/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import Modal from '../components/organisms/Modal/Modal'
import Toast from '../components/organisms/Toast/Toast'
import PremiumModal from '../components/organisms/PremiumModal/PremiumModal'
import CalculatorModal from '../components/organisms/CalculatorModal/CalculatorModal'
import TrainingDaysModal from '../components/organisms/TrainingDaysModal/TrainingDaysModal'
import { telegramLogin, telegramWidgetLogin, emailLogin, emailRegister, linkTelegram } from '../api/auth'
import { getMe, updateMe, updateTrainingSchedule } from '../api/users'
import { ACCESS_KEY, REFRESH_KEY, cleanupLegacyTokens } from '../api/tokenStorage'

const AppUIContext = createContext(null)

const TRAINING_DAYS_KEY = 'trainapp_training_days'

// Сессии старой сборки (автологин dev-пользователем) не должны переживать обновление.
cleanupLegacyTokens()

// Запуск внутри Telegram Mini App определяется наличием initData.
export const isTelegramMiniApp = () => Boolean(window.Telegram?.WebApp?.initData)

function getInitialTrainingDays() {
  try {
    const stored = localStorage.getItem(TRAINING_DAYS_KEY)
    return stored ? JSON.parse(stored) : ['mon', 'wed', 'fri']
  } catch {
    return ['mon', 'wed', 'fri']
  }
}

export function AppUIProvider({ children }) {
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(null)
  const [premiumOpen, setPremiumOpen] = useState(false)
  const [calculatorOpen, setCalculatorOpen] = useState(false)
  const [trainingDaysOpen, setTrainingDaysOpen] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [trainingDays, setTrainingDays] = useState(getInitialTrainingDays)
  // 'loading' — определяем сессию; 'guest' — показываем welcome; 'authed' — в приложении.
  // Если нет ни initData, ни токена — гость сразу, без асинхронной проверки.
  const [authStatus, setAuthStatus] = useState(() =>
    isTelegramMiniApp() || localStorage.getItem(ACCESS_KEY) ? 'loading' : 'guest',
  )

  const applyAuthedUser = useCallback((user, tokens) => {
    if (tokens) {
      localStorage.setItem(ACCESS_KEY, tokens.access)
      localStorage.setItem(REFRESH_KEY, tokens.refresh)
    }
    setUserProfile(user)
    if (user?.training_days?.length) {
      setTrainingDays(user.training_days)
      try {
        localStorage.setItem(TRAINING_DAYS_KEY, JSON.stringify(user.training_days))
      } catch { /* noop */ }
    }
    setAuthStatus('authed')
  }, [])

  useEffect(() => {
    const initData = window.Telegram?.WebApp?.initData || ''

    if (initData) {
      // Мини-апп: автовход по initData, без экранов входа.
      telegramLogin(initData)
        .then(({ data }) => applyAuthedUser(data.user, data.tokens))
        .catch(() => setAuthStatus('guest'))
      return
    }

    // Браузер: живём по сохранённым токенам; без токена статус уже 'guest'.
    if (localStorage.getItem(ACCESS_KEY)) {
      getMe()
        .then(({ data }) => applyAuthedUser(data, null))
        .catch(() => {
          localStorage.removeItem(ACCESS_KEY)
          localStorage.removeItem(REFRESH_KEY)
          setAuthStatus('guest')
        })
    }
  }, [applyAuthedUser])

  const closeModal = useCallback(() => setModal(null), [])

  const showToast = useCallback((message) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2800)
  }, [])

  const showModal = useCallback((config) => {
    setModal({ ...config, id: Date.now() })
  }, [])

  const showInfo = useCallback(
    (title, message, actionLabel = 'Понятно') => {
      showModal({
        title,
        message,
        actions: [{ label: actionLabel, variant: 'primary', onClick: closeModal }],
      })
    },
    [closeModal, showModal],
  )

  const showConfirm = useCallback(
    (title, message, onConfirm, confirmLabel = 'Подтвердить') => {
      showModal({
        title,
        message,
        actions: [
          { label: 'Отмена', variant: 'secondary', onClick: closeModal },
          {
            label: confirmLabel,
            variant: 'primary',
            onClick: () => {
              closeModal()
              onConfirm?.()
            },
          },
        ],
      })
    },
    [closeModal, showModal],
  )

  const showPremium = useCallback(() => setPremiumOpen(true), [])
  const closePremium = useCallback(() => setPremiumOpen(false), [])

  const showCalculator = useCallback(() => setCalculatorOpen(true), [])
  const closeCalculator = useCallback(() => setCalculatorOpen(false), [])

  const showTrainingDays = useCallback(() => setTrainingDaysOpen(true), [])
  const closeTrainingDays = useCallback(() => setTrainingDaysOpen(false), [])

  const saveTrainingDays = useCallback((days) => {
    setTrainingDays(days)
    try { localStorage.setItem(TRAINING_DAYS_KEY, JSON.stringify(days)) } catch { /* noop */ }
    setTrainingDaysOpen(false)
    updateTrainingSchedule(days).catch(() => {})
  }, [])

  const updateUserProfile = useCallback((nextUser) => {
    setUserProfile((prev) => {
      const next = {
        ...prev,
        ...nextUser,
        subscription: {
          ...(prev?.subscription || {}),
          ...(nextUser.subscription || {}),
        },
      }
      return next
    })
    const { subscription, ...apiData } = nextUser
    if (Object.keys(apiData).length) {
      updateMe(apiData).then(({ data }) => setUserProfile(data)).catch(() => {})
    }
  }, [])

  // Анкета проставляет и профиль, и рекомендованное расписание разом.
  const completeOnboarding = useCallback((nextUser) => {
    setUserProfile(nextUser)
    if (nextUser?.training_days?.length) {
      setTrainingDays(nextUser.training_days)
      try {
        localStorage.setItem(TRAINING_DAYS_KEY, JSON.stringify(nextUser.training_days))
      } catch { /* noop */ }
    }
  }, [])

  const loginWithEmail = useCallback(
    (email, password) =>
      emailLogin(email, password).then(({ data }) => {
        applyAuthedUser(data.user, data.tokens)
        return data.user
      }),
    [applyAuthedUser],
  )

  const registerWithEmail = useCallback(
    (payload) =>
      emailRegister(payload).then(({ data }) => {
        applyAuthedUser(data.user, data.tokens)
        return data
      }),
    [applyAuthedUser],
  )

  const loginWithTelegramWidget = useCallback(
    (widgetUser) =>
      telegramWidgetLogin(widgetUser).then(({ data }) => {
        applyAuthedUser(data.user, data.tokens)
        return data.user
      }),
    [applyAuthedUser],
  )

  const linkTelegramAccount = useCallback(
    (widgetUser) =>
      linkTelegram(widgetUser).then(({ data }) => {
        setUserProfile(data.user)
        return data.user
      }),
    [],
  )

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    setUserProfile(null)
    setAuthStatus('guest')
  }, [])

  // Вход dev-пользователем без Telegram (TELEGRAM_DEV_MODE на бэке).
  const devLogin = useCallback(
    () =>
      telegramLogin('').then(({ data }) => {
        applyAuthedUser(data.user, data.tokens)
        return data.user
      }),
    [applyAuthedUser],
  )

  const workoutCount = userProfile?.workout_count ?? 0
  const isOnboarded = Boolean(userProfile?.is_onboarded)
  const authReady = authStatus !== 'loading'
  const isAuthenticated = authStatus === 'authed'

  const value = useMemo(
    () => ({
      authReady,
      authStatus,
      isAuthenticated,
      showToast,
      showModal,
      showInfo,
      showConfirm,
      closeModal,
      showPremium,
      showCalculator,
      workoutCount,
      trainingDays,
      showTrainingDays,
      userProfile,
      updateUserProfile,
      isOnboarded,
      completeOnboarding,
      loginWithEmail,
      registerWithEmail,
      loginWithTelegramWidget,
      linkTelegramAccount,
      logout,
      devLogin,
    }),
    [authReady, authStatus, isAuthenticated, showToast, showModal, showInfo, showConfirm, closeModal, showPremium, showCalculator, workoutCount, trainingDays, showTrainingDays, userProfile, updateUserProfile, isOnboarded, completeOnboarding, loginWithEmail, registerWithEmail, loginWithTelegramWidget, linkTelegramAccount, logout, devLogin],
  )

  return (
    <AppUIContext.Provider value={value}>
      {children}
      {modal ? <Modal {...modal} onClose={closeModal} /> : null}
      {toast ? <Toast message={toast} /> : null}
      {premiumOpen ? <PremiumModal onClose={closePremium} /> : null}
      {calculatorOpen ? <CalculatorModal onClose={closeCalculator} /> : null}
      {trainingDaysOpen ? <TrainingDaysModal selectedDays={trainingDays} onSave={saveTrainingDays} onClose={closeTrainingDays} /> : null}
    </AppUIContext.Provider>
  )
}

export function useAppUI() {
  const ctx = useContext(AppUIContext)
  if (!ctx) throw new Error('useAppUI must be used within AppUIProvider')
  return ctx
}
