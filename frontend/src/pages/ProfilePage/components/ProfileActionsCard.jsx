function ProfileActionsCard({ actions, onAction }) {
  return (
    <div className="card profile-list animate-in delay-2">
      {actions.map((item) => (
        <button key={item.id} type="button" className="profile-row" onClick={() => onAction(`Открыт раздел: ${item.title}`)}>
          <span>{item.title}</span>
          <strong>{item.value}</strong>
        </button>
      ))}
    </div>
  )
}

export default ProfileActionsCard
