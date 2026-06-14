function GreetingCard({ userName }) {
  return (
    <div className="greeting card animate-in">
      <p>Привет, {userName}! <br/>Готов к победам сегодня?</p>
    </div>
  )
}

export default GreetingCard
