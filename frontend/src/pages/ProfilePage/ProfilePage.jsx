import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppUI } from '../../context/AppUIContext'
import { getMySubscription } from '../../api/payments'
import SectionHead from '../../components/common/SectionHead'
import ProfileMainCard from './components/ProfileMainCard'
import ProfileActionsCard from './components/ProfileActionsCard'
import SubscriptionCard from './components/SubscriptionCard'
import SettingsCard from './components/SettingsCard'
import PersonalDataModal from './components/PersonalDataModal'
import { FaCalculator, FaCrown } from 'react-icons/fa6'
import './ProfilePage.scss'

// Уведомления живут в SettingsCard, где тумблеры реально сохраняются.
const PROFILE_ACTIONS = [
  { id: 'personal', title: 'Личные данные', value: 'Редактировать' },
  { id: 'subscription', title: 'Подписка', value: 'Premium' },
  { id: 'settings', title: 'Настройки', value: 'Открыть' },
]

function ProfilePage() {
  const navigate = useNavigate()
  const { showInfo, showPremium, showCalculator, userProfile, updateUserProfile } = useAppUI()
  const [personalModalOpen, setPersonalModalOpen] = useState(false)
  const [subscription, setSubscription] = useState(null)

  useEffect(() => {
    getMySubscription()
      .then(({ data }) => setSubscription(data))
      .catch(() => {})
  }, [])

  const savePersonalData = (nextUser) => {
    const mapped = {
      display_name: nextUser.name,
      email: nextUser.email,
      gender: { 'Мужской': 'male', 'Женский': 'female', 'Другое': 'other' }[nextUser.gender] || nextUser.gender,
      weight: nextUser.weight,
      height: nextUser.height,
      goal: { 'Сушка': 'cut', 'Набор массы': 'bulk', 'Поддержание': 'maintain', 'Выносливость': 'endurance', 'Рекомпозиция': 'recomp' }[nextUser.goal] || nextUser.goal,
    }
    updateUserProfile(mapped)
    setPersonalModalOpen(false)
  }

  const handleAction = (actionId) => {
    if (actionId === 'personal') { setPersonalModalOpen(true); return }
    if (actionId === 'subscription') { showPremium(); return }
    if (actionId === 'settings') {
      showInfo('Настройки', 'Язык: Русский\nТема: Тёмная\nЕдиницы: кг / см')
    }
  }

  const subscriptionData = subscription
    ? { plan: subscription.plan, status: subscription.status, nextCharge: subscription.next_charge }
    : userProfile?.subscription

  return (
    <section className="page page-profile">
      <SectionHead title="Профиль" />

      <ProfileMainCard user={userProfile} />
      <ProfileActionsCard actions={PROFILE_ACTIONS} onAction={handleAction} />

      <div className="profile-action-buttons card animate-in delay-2">
        <button type="button" className="profile-action-btn" onClick={showCalculator}>
          <FaCalculator />
          <span>Калькулятор TDEE / BMI</span>
        </button>
        <button type="button" className="profile-action-btn profile-action-btn--premium" onClick={showPremium}>
          <FaCrown />
          <span>Управление Premium</span>
        </button>
      </div>

      <div className="profile-extra-links card animate-in delay-2">
        <button type="button" className="profile-row" onClick={() => navigate('/nutrition')}>
          <span>Питание</span>
          <strong>Открыть</strong>
        </button>
        <button type="button" className="profile-row" onClick={() => navigate('/knowledge')}>
          <span>База знаний</span>
          <strong>Открыть</strong>
        </button>
        <button type="button" className="profile-row" onClick={() => navigate('/analytics')}>
          <span>Аналитика</span>
          <strong>Открыть</strong>
        </button>
      </div>

      <SubscriptionCard subscription={subscriptionData} onManage={showPremium} />

      <SettingsCard />

      {personalModalOpen ? (
        <PersonalDataModal
          user={userProfile}
          onSave={savePersonalData}
          onClose={() => setPersonalModalOpen(false)}
        />
      ) : null}
    </section>
  )
}

export default ProfilePage
