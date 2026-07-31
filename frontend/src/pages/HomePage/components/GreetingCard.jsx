import { useAppUI } from '../../../context/AppUIContext'

function GreetingCard({ userName, gender }) {
  const { t } = useAppUI()
  const ready = gender === 'female' ? t('home.readyFemale') : t('home.readyMale')
  return (
    <div className="greeting card animate-in">
      <p>{t('home.greeting', { name: userName })} <br/>{ready}</p>
    </div>
  )
}

export default GreetingCard
