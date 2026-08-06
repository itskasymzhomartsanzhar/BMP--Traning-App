import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { FaCrown, FaCheck, FaMobileScreen } from 'react-icons/fa6'
import { useAppUI, isTelegramMiniApp } from '../../context/AppUIContext'
import { getSubscriptionPlans, createPayment } from '../../api/payments'
import './PremiumPage.scss'

// Скриншоты приложения: положите файлы в src/assets/screenshots/ —
// они подхватятся автоматически, без правок кода. Пока их нет,
// карусель показывает рамки-плейсхолдеры.
const screenshotModules = import.meta.glob('../../assets/screenshots/*.{png,jpg,jpeg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
})
const SCREENSHOTS = Object.keys(screenshotModules).sort().map((key) => screenshotModules[key])
const PLACEHOLDER_COUNT = 4

// Только то, что реально есть в приложении — без пустых обещаний.
const FEATURE_KEYS = ['premium.f1', 'premium.f2', 'premium.f3', 'premium.f4', 'premium.f5', 'premium.f6']

function PremiumPage() {
  const navigate = useNavigate()
  const { userProfile, refreshUserProfile, showToast, logout, showConfirm, t } = useAppUI()
  const [selected, setSelected] = useState('annual')
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState([])

  useEffect(() => {
    getSubscriptionPlans()
      .then(({ data }) => setPlans(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  // Подписка уже активна — на пейволле делать нечего.
  if (userProfile?.is_premium) return <Navigate to="/" replace />

  const handleSubscribe = () => {
    setLoading(true)
    // После оплаты в ЮKassa пользователь должен вернуться в приложение.
    createPayment(selected, `${window.location.origin}/premium`)
      .then(({ data }) => {
        if (data.confirmation_url) {
          window.location.href = data.confirmation_url
          return
        }
        // Дев-режим: платёж успешен сразу — обновляем профиль и входим.
        refreshUserProfile()
          .then(() => navigate('/', { replace: true }))
          .catch(() => setLoading(false))
      })
      .catch(() => {
        showToast(t('premium.payError'))
        setLoading(false)
      })
  }

  const planLabel = (plan) => (plan.id === 'monthly' ? t('premium.month') : t('premium.year'))
  const planPer = (plan) => (plan.billing_period === 'month' ? t('premium.perMonth') : t('premium.perYear'))

  return (
    <section className="premium-page">
      <div className="premium-page__hero animate-in">
        <div className="premium-page__crown"><FaCrown aria-hidden="true" /></div>
        <h1>TRES Premium</h1>
        <p>{t('premium.subtitle')}</p>
      </div>

      <ul className="premium-page__features card animate-in delay-1">
        {FEATURE_KEYS.map((key) => (
          <li key={key}>
            <FaCheck className="premium-page__check" aria-hidden="true" />
            <span>{t(key)}</span>
          </li>
        ))}
      </ul>

      <div className="premium-page__plans animate-in delay-2">
        {plans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            className={`premium-page__plan${selected === plan.id ? ' is-selected' : ''}`}
            onClick={() => setSelected(plan.id)}
          >
            <span className="premium-page__plan-label">
              <strong>{planLabel(plan)}</strong>
              {plan.savings_percent ? <em>{t('premium.saving', { percent: plan.savings_percent })}</em> : null}
            </span>
            <span className="premium-page__plan-price">
              <strong>{plan.price.toLocaleString('ru-RU')}₽</strong>
              <small>{planPer(plan)}</small>
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        className="primary premium-page__cta animate-in delay-2"
        onClick={handleSubscribe}
        disabled={loading || plans.length === 0}
      >
        {loading ? t('premium.processing') : t('premium.subscribe')}
      </button>
      <p className="premium-page__note animate-in delay-2">{t('premium.note')}</p>

      <h2 className="premium-page__shots-title animate-in delay-3">{t('premium.screensTitle')}</h2>
      <div className="premium-page__shots animate-in delay-3">
        {SCREENSHOTS.length > 0
          ? SCREENSHOTS.map((src) => (
            <div key={src} className="premium-page__shot">
              <img src={src} alt="" loading="lazy" />
            </div>
          ))
          : Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
            <div key={index} className="premium-page__shot premium-page__shot--empty">
              <FaMobileScreen aria-hidden="true" />
              <span>{t('premium.screenSoon')}</span>
            </div>
          ))}
      </div>

      {!isTelegramMiniApp() && (
        <button
          type="button"
          className="premium-page__logout"
          onClick={() => showConfirm(t('profile.logoutTitle'), t('profile.logoutConfirm'), logout, t('profile.logoutAction'))}
        >
          {t('profile.logout')}
        </button>
      )}
    </section>
  )
}

export default PremiumPage
