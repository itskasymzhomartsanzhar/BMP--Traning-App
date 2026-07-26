function GreetingCard({ userName, gender }) {
  const ready = gender === 'female' ? 'Готова' : 'Готов'
  return (
    <div className="greeting card animate-in">
      <p>Привет, {userName}! <br/>{ready} к победам сегодня?</p>
    </div>
  )
}

export default GreetingCard
