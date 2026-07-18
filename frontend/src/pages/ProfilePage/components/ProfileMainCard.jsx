function ProfileMainCard({ user }) {
  if (!user) return null

  const genderDisplay = user.gender_display || user.gender || '—'
  const goalDisplay = user.goal_display || user.goal || '—'

  return (
    <div className="card profile-main animate-in delay-1">
      <h2>{user.name || user.display_name || user.first_name || 'Пользователь'}</h2>
      <p>{user.email || '—'}</p>
      <div className="profile-tags">
        <span>{genderDisplay}</span>
        <span>{user.height ? `${user.height} см` : '—'}</span>
        <span>{user.weight ? `${user.weight} кг` : '—'}</span>
        <span>{goalDisplay}</span>
      </div>
    </div>
  )
}

export default ProfileMainCard
