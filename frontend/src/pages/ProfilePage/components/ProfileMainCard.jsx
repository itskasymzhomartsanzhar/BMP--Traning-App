function ProfileMainCard({ user }) {
  return (
    <div className="card profile-main animate-in delay-1">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <div className="profile-tags">
        <span>{user.gender}</span>
        <span>{user.height} см</span>
        <span>{user.weight} кг</span>
        <span>{user.goal}</span>
      </div>
    </div>
  )
}

export default ProfileMainCard
