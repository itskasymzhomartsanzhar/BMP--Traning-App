function SubscriptionCard({ subscription, onManage }) {
  if (!subscription) return null

  return (
    <div className="card subscription-card animate-in delay-3">
      <h2>Подписка</h2>
      <div className="subscription-line">
        <span>Тариф</span>
        <strong>{subscription.plan || 'Free'}</strong>
      </div>
      <div className="subscription-line">
        <span>Статус</span>
        <strong>{subscription.status || '—'}</strong>
      </div>
      {subscription.nextCharge ? (
        <div className="subscription-line">
          <span>Следующее списание</span>
          <strong>{subscription.nextCharge}</strong>
        </div>
      ) : null}
      <button type="button" className="secondary" onClick={onManage}>
        Управлять подпиской
      </button>
    </div>
  )
}

export default SubscriptionCard
