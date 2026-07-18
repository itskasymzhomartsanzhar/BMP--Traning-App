import { useEffect, useState } from 'react'
import { FaCrown, FaCheck, FaBolt, FaXmark } from 'react-icons/fa6'
import { getSubscriptionPlans, createPayment } from '../../../api/payments'
import { useAppUI } from '../../../context/AppUIContext'
import './PremiumModal.scss'

const FEATURES = [
  'Безлимитные программы тренировок',
  'Персональный план питания с AI',
  'Расширенная аналитика и графики',
  'Видео-инструкции к каждому упражнению',
  'Калькулятор TDEE / BMI / макросов',
  'Приоритетная поддержка 24/7',
  'Экспорт данных PDF / CSV',
]

function PremiumModal({ onClose }) {
  const [selected, setSelected] = useState('annual')
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState([
    { id: 'monthly', label: 'Месяц', price: '990₽', per: 'в месяц', tag: null },
    { id: 'annual', label: 'Год', price: '4 990₽', per: 'в год', tag: 'Выгода 58%' },
  ])
  const { showToast } = useAppUI()

  useEffect(() => {
    getSubscriptionPlans()
      .then(({ data }) => {
        setPlans(data.map((p) => ({
          id: p.id,
          label: p.label,
          price: `${p.price.toLocaleString('ru-RU')}₽`,
          per: p.billing_period === 'month' ? 'в месяц' : 'в год',
          tag: p.savings_percent ? `Выгода ${p.savings_percent}%` : null,
        })))
      })
      .catch(() => {})
  }, [])

  const handleSubscribe = () => {
    setLoading(true)
    createPayment(selected)
      .then(({ data }) => {
        if (data.confirmation_url) {
          window.location.href = data.confirmation_url
        } else {
          onClose()
        }
      })
      .catch(() => {
        showToast('Ошибка оплаты. Попробуйте снова.')
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
          <p>Разблокируй весь потенциал своего тела</p>
        </div>

        <ul className="premium-features">
          {FEATURES.map((f) => (
            <li key={f}>
              <FaCheck className="premium-check" />
              <span>{f}</span>
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
              Подключить Premium
            </>
          )}
        </button>

        <p className="premium-legal">
          Отмена подписки в любой момент · Безопасная оплата
        </p>
      </div>
    </div>
  )
}

export default PremiumModal
