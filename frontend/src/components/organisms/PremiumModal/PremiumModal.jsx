import { useEffect, useState } from 'react'
import { FaCrown, FaCheck, FaBolt, FaXmark } from 'react-icons/fa6'
import { getSubscriptionPlans, createPayment } from '../../../api/payments'
import { useAppUI } from '../../../context/AppUIContext'
import './PremiumModal.scss'

// Только реальные возможности приложения — без пустых обещаний.
const FEATURE_KEYS = ['premium.f1', 'premium.f2', 'premium.f3', 'premium.f4', 'premium.f5', 'premium.f6']

function PremiumModal({ onClose }) {
  const [selected, setSelected] = useState('annual')
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState([])
  const { showToast, refreshUserProfile, t } = useAppUI()

  useEffect(() => {
    getSubscriptionPlans()
      .then(({ data }) => {
        setPlans(data.map((p) => ({
          id: p.id,
          label: p.id === 'monthly' ? t('premium.month') : t('premium.year'),
          price: `${p.price.toLocaleString('ru-RU')}₽`,
          per: p.billing_period === 'month' ? t('premium.perMonth') : t('premium.perYear'),
          tag: p.savings_percent ? t('premium.saving', { percent: p.savings_percent }) : null,
        })))
      })
      .catch(() => {})
  }, [t])

  const handleSubscribe = () => {
    setLoading(true)
    createPayment(selected, `${window.location.origin}/profile`)
      .then(({ data }) => {
        if (data.confirmation_url) {
          window.location.href = data.confirmation_url
        } else {
          // Дев-режим: успех сразу — подтягиваем свежий статус подписки.
          refreshUserProfile().catch(() => {})
          onClose()
        }
      })
      .catch(() => {
        showToast(t('premium.payError'))
        setLoading(false)
      })
  }

  return (
    <div className="premium-overlay" role="presentation" onClick={onClose}>
      <div
        className="premium-sheet"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="premium-sheet__close" onClick={onClose} aria-label="Закрыть">
          <FaXmark />
        </button>

        <div className="premium-sheet__hero">
          <div className="premium-crown">
            <FaCrown />
          </div>
          <h1>PREMIUM</h1>
          <p>{t('premium.subtitle')}</p>
        </div>

        <ul className="premium-features">
          {FEATURE_KEYS.map((key) => (
            <li key={key}>
              <FaCheck className="premium-check" />
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>

        <div className="premium-plans">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              className={`premium-plan${selected === plan.id ? ' is-selected' : ''}`}
              onClick={() => setSelected(plan.id)}
            >
              <div className="premium-plan__left">
                <strong>{plan.label}</strong>
                {plan.tag ? <span className="premium-plan__tag">{plan.tag}</span> : null}
              </div>
              <div className="premium-plan__price">
                <strong>{plan.price}</strong>
                <small>{plan.per}</small>
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="premium-subscribe"
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading ? (
            <span className="premium-subscribe__loader" />
          ) : (
            <>
              <FaBolt />
              {t('premium.subscribe')}
            </>
          )}
        </button>

        <p className="premium-legal">{t('premium.note')}</p>
      </div>
    </div>
  )
}

export default PremiumModal
