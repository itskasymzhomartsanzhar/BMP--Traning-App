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
  const { registerWithEmail, isAuthenticated, t } = useAppUI()

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
        onSubmit={(payload, form) => {
          // «Своя программа»: опрос закончен — сразу к созданию аккаунта.
          if (payload.level === 'custom') {
            setAnketa(payload)
            setUserName(form.name.trim())
            setRecommendation(null)
            setPhase('account')
            return Promise.resolve()
          }
          return planPreview(payload).then(({ data }) => {
            setAnketa(payload)
            setUserName(form.name.trim())
            setRecommendation(data)
            setPhase('plan')
          })
        }}
      />
    )
  }

  if (phase === 'plan') {
    return (
      <OnboardingResult
        recommendation={recommendation}
        userName={userName}
        startLabel={t('common.start')}
        onStart={() => setPhase('account')}
        onSkip={recommendation?.program ? null : () => setPhase('account')}
        skipLabel={t('onb.continue')}
      />
    )
  }

  const submit = (event) => {
    event.preventDefault()
    const cleanEmail = email.trim()
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError(t('onb.errEmailInvalid'))
      return
    }
    if (password.length < 8) {
      setError(t('onb.errPassword8'))
      return
    }
    if (password !== password2) {
      setError(t('auth.passwordsMismatch'))
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
        setError(first ? String(first) : t('auth.registerError'))
      })
      .finally(() => setSaving(false))
  }

  return (
    <section className="auth-page">
      <div className="auth-page__bg" aria-hidden="true" />

      <div className="auth-page__content">
        <form className="auth-form" onSubmit={submit} noValidate>
          <div className="auth-form__head">
            <button type="button" className="auth-form__back" onClick={() => setPhase(recommendation ? 'plan' : 'quiz')} aria-label={t('common.back')}>
              <FaArrowLeft />
            </button>
          </div>

          <h1 className="auth-form__title">{t('auth.almostDone')}</h1>
          <p className="auth-form__subtitle">{t('auth.almostDoneSub')}</p>

          {recommendation?.program && (
            <div className="auth-plan-note">
              {t('auth.yourPlan')} <strong>{recommendation.program.title}</strong> · {recommendation.reason}
            </div>
          )}

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
              {t('auth.passwordMin8')}
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
              {t('auth.repeatPassword')}
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
              {saving ? t('auth.creatingAccount') : t('auth.registerAndStart')}
            </button>

            <p className="auth-form__switch">
              {t('auth.haveAccount')}{' '}
              <button type="button" onClick={() => navigate('/login')}>{t('auth.signIn')}</button>
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}

export default RegisterPage
