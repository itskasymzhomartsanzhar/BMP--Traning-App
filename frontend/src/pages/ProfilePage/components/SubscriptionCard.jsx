import { useAppUI } from '../../../context/AppUIContext'

function SubscriptionCard({ subscription, onManage }) {
  const { t } = useAppUI()
  if (!subscription) return null

  return (
    <div className="card subscription-card animate-in delay-3">
      <h2>{t('profile.subscription')}</h2>
      <div className="subscription-line">
        <span>{t('profile.plan')}</span>
        <strong>{subscription.plan || 'Free'}</strong>
      </div>
      <div className="subscription-line">
        <span>{t('profile.status')}</span>
        <strong>{subscription.status || '—'}</strong>
      </div>
      {subscription.nextCharge ? (
        <div className="subscription-line">
          <span>{t('profile.nextCharge')}</span>
          <strong>{subscription.nextCharge}</strong>
        </div>
      ) : null}
      <button type="button" className="secondary" onClick={onManage}>
        {t('profile.manageSubscription')}
      </button>
    </div>
  )
}

export default SubscriptionCard
