import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa6'
import { useAppUI } from '../../context/AppUIContext'
import { planPreview } from '../../api/auth'
import OnboardingWizard from '../OnboardingPage/OnboardingWizard'
import OnboardingResult from '../OnboardingPage/OnboardingResult'
import './AuthPages.scss'

// Флоу регистрации: опрос → показ плана → почта и пароль → сразу в тренировку.
function RegisterPage() {
  const navigate = useNavigate()
  const { registerWithEmail, isAuthenticated } = useAppUI()

  const [phase, setPhase] = useState('quiz') // quiz | plan | account
  const [anketa, setAnketa] = useState(null)
  const [userName, setUserName] = useState('')
  const [recommendation, setRecommendation] = useState(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Уже вошедший пользователь попал сюда вручную — на главную. Но после
  // НАШЕЙ регистрации (phase !== 'quiz') редиректом управляет submit.
  if (isAuthenticated && phase === 'quiz') {
    return <Navigate to="/" replace />
  }

  if (phase === 'quiz') {
    return (
      <OnboardingWizard
        onBackFromFirst={() => navigate('/welcome')}
        onSubmit={(payload, form) =>
          planPreview(payload).then(({ data }) => {
            setAnketa(payload)
            setUserName(form.name.trim())
            setRecommendation(data)
            setPhase('plan')
          })
        }
      />
    )
  }

  if (phase === 'plan') {
    return (
      <OnboardingResult
        recommendation={recommendation}
        userName={userName}
        startLabel="Начать"
        onStart={() => setPhase('account')}
        onSkip={recommendation?.program ? null : () => setPhase('account')}
        skipLabel="Продолжить"
      />
    )
  }

  const submit = (event) => {
    event.preventDefault()
    const cleanEmail = email.trim()
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Введите корректную почту.')
      return
    }
    if (password.length < 8) {
      setError('Пароль должен быть не короче 8 символов.')
      return
    }
    if (password !== password2) {
      setError('Пароли не совпадают.')
      return
    }

    setSaving(true)
    setError('')
    registerWithEmail({ ...anketa, email: cleanEmail, password })
      .then((data) => {
        const programId = data.recommendation?.program_id
        navigate(programId ? `/trainings/${programId}` : '/', { replace: true })
      })
      .catch((err) => {
        const detail = err.response?.data
        const first = detail && typeof detail === 'object' ? Object.values(detail).flat()[0] : null
        setError(first ? String(first) : 'Не удалось создать аккаунт. Попробуйте ещё раз.')
      })
      .finally(() => setSaving(false))
  }

  return (
    <section className="auth-page">
      <div className="auth-page__bg" aria-hidden="true" />

      <div className="auth-page__content">
        <form className="auth-form" onSubmit={submit} noValidate>
          <div className="auth-form__head">
            <button type="button" className="auth-form__back" onClick={() => setPhase('plan')} aria-label="Назад">
              <FaArrowLeft />
            </button>
          </div>

          <h1 className="auth-form__title">Почти готово</h1>
          <p className="auth-form__subtitle">Создайте аккаунт, чтобы сохранить план и начать тренировку.</p>

          {recommendation?.program && (
            <div className="auth-plan-note">
              Ваш план: <strong>{recommendation.program.title}</strong> · {recommendation.reason}
            </div>
          )}

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
              Пароль (минимум 8 символов)
              <input
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(error)}
              />
            </label>

            <label className="auth-form__field">
              Повторите пароль
              <input
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                aria-invalid={Boolean(error)}
              />
            </label>

            {error && <span className="auth-form__error">{error}</span>}
          </div>

          <div className="auth-form__foot">
            <button type="submit" className="auth-actions__primary" disabled={saving}>
              {saving ? 'Создаём аккаунт…' : 'Зарегистрироваться и начать'}
            </button>

            <p className="auth-form__switch">
              Уже есть аккаунт?{' '}
              <button type="button" onClick={() => navigate('/login')}>Войти</button>
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}

export default RegisterPage
