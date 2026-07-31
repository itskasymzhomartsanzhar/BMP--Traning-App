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
import SettingsModal from './components/SettingsModal'
import './ProfilePage.scss'



function ProfilePage() {
  const navigate = useNavigate()
  const { showPremium, showCalculator, userProfile, updateUserProfile, t } = useAppUI()

  // Уведомления живут в SettingsCard, где тумблеры реально сохраняются.
  const profileActions = [
    { id: 'personal', title: t('profile.personal'), value: t('common.edit') },
    { id: 'settings', title: t('profile.settings'), value: t('common.open') },
  ]
  const [personalModalOpen, setPersonalModalOpen] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [subscription, setSubscription] = useState(null)

  useEffect(() => {
    getMySubscription()
      .then(({ data }) => setSubscription(data))
      .catch(() => {})
  }, [])

  // Почта, вес и рост здесь не редактируются: почта — логин, вес и рост
  // меняются замерами на странице Аналитика.
  const savePersonalData = (nextUser) => {
    const mapped = {
      display_name: nextUser.name,
      gender: { 'Мужской': 'male', 'Женский': 'female' }[nextUser.gender] || nextUser.gender,
      goal: { 'Сушка': 'cut', 'Набор массы': 'bulk', 'Поддержание': 'maintain', 'Выносливость': 'endurance', 'Рекомпозиция': 'recomp' }[nextUser.goal] || nextUser.goal,
    }
    updateUserProfile(mapped)
    setPersonalModalOpen(false)
  }

  const handleAction = (actionId) => {
    if (actionId === 'personal') { setPersonalModalOpen(true); return }
    if (actionId === 'settings') setSettingsModalOpen(true)
  }

  const subscriptionData = subscription
    ? { plan: subscription.plan, status: subscription.status, nextCharge: subscription.next_charge }
    : userProfile?.subscription

  return (
    <section className="page page-profile">
      <SectionHead title={t('profile.title')} />

      <ProfileMainCard user={userProfile} />
      <ProfileActionsCard actions={profileActions} onAction={handleAction} />

      <div className="profile-extra-links card animate-in delay-2">
        <button type="button" className="profile-row" onClick={() => navigate('/nutrition')}>
          <span>{t('profile.nutrition')}</span>
          <strong>{t('common.open')}</strong>
        </button>
        <button type="button" className="profile-row" onClick={showCalculator}>
          <span>{t('profile.calculator')}</span>
          <strong>{t('common.open')}</strong>
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

      {settingsModalOpen ? (
        <SettingsModal
          user={userProfile}
          onSave={updateUserProfile}
          onClose={() => setSettingsModalOpen(false)}
        />
      ) : null}
    </section>
  )
}

export default ProfilePage
