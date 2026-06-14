function SettingsCard({ onAction }) {
  return (
    <div className="card settings-card animate-in delay-3">
      <h2>Настройки</h2>

      <button type="button" className="toggle-row" onClick={() => onAction('Переключены push-уведомления')}>
        <span>Push-уведомления</span>
        <span className="toggle is-on">ON</span>
      </button>

      <button type="button" className="toggle-row" onClick={() => onAction('Переключена email-рассылка')}>
        <span>Email-рассылка</span>
        <span className="toggle">OFF</span>
      </button>

      <button type="button" className="toggle-row" onClick={() => onAction('Открыта смена пароля')}>
        <span>Сменить пароль</span>
        <span className="arrow">›</span>
      </button>
    </div>
  )
}

export default SettingsCard
