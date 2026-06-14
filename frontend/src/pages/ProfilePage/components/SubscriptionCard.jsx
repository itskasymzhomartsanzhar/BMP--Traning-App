function SubscriptionCard({ subscription, onManage }) {
  return (
    <div className="card subscription-card animate-in delay-3">
      <h2>Подписка</h2>
      <div className="subscription-line">
        <span>Тариф</span>
        <strong>{subscription.plan}</strong>
      </div>
      <div className="subscription-line">
        <span>Статус</span>
        <strong>{subscription.status}</strong>
      </div>
      <div className="subscription-line">
        <span>Следующее списание</span>
        <strong>{subscription.nextCharge}</strong>
      </div>
      <button type="button" className="secondary" onClick={onManage}>
        Управлять подпиской
      </button>
    </div>
  )
}

export default SubscriptionCard
