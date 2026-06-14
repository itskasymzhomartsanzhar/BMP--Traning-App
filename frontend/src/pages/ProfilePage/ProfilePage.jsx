import SectionHead from '../../components/common/SectionHead'
import ProfileMainCard from './components/ProfileMainCard'
import ProfileActionsCard from './components/ProfileActionsCard'
import SubscriptionCard from './components/SubscriptionCard'
import CalculatorCard from './components/CalculatorCard'
import SettingsCard from './components/SettingsCard'
import './ProfilePage.css'

function ProfilePage({
  user,
  actions,
  calculatorType,
  calculatorForm,
  calculatorResult,
  onCalculatorTypeChange,
  onCalculatorFieldChange,
  onCalculate,
  onAction,
}) {
  return (
    <section className="page page-profile">
      <SectionHead
        title="Личный кабинет"
        icon="user"
        iconMessage="Профиль"
        onIconClick={() => onAction('Открыт профиль пользователя')}
      />

      <ProfileMainCard user={user} />
      <ProfileActionsCard actions={actions} onAction={onAction} />
      <SubscriptionCard subscription={user.subscription} onManage={() => onAction('Управление подпиской открыто')} />

      <CalculatorCard
        type={calculatorType}
        form={calculatorForm}
        result={calculatorResult}
        onTypeChange={onCalculatorTypeChange}
        onFieldChange={onCalculatorFieldChange}
        onCalculate={onCalculate}
      />

      <SettingsCard onAction={onAction} />
    </section>
  )
}

export default ProfilePage
