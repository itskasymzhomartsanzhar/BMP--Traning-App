import GreetingCard from './components/GreetingCard'
import GoalCard from './components/GoalCard'
import HomeStatsGrid from './components/HomeStatsGrid'
import TodayPlanCard from './components/TodayPlanCard'
import './HomePage.css'

function HomePage({ user, stats, weeklyGoal, todayPlan, onAction, onStartSession }) {
  return (
    <section className="page page-home">
      <GreetingCard userName={user.name} />
      <GoalCard
        goal={weeklyGoal}
        onEdit={() => onAction('Открыто редактирование недельной цели')}
        onDayClick={(day) => onAction(`Выбран день: ${day.label} ${day.date}`)}
      />
      <HomeStatsGrid stats={stats} onStatClick={(item) => onAction(`${item.label}: ${item.value}`)} />
      <TodayPlanCard items={todayPlan} onStart={onStartSession} />
    </section>
  )
}

export default HomePage
