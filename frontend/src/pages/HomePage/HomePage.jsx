import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppUI } from '../../context/AppUIContext'
import { getDashboard } from '../../api/users'
import GreetingCard from './components/GreetingCard'
import YourGoalCard from './components/YourGoalCard'
import GoalCard from './components/GoalCard'
import HomeStatsGrid from './components/HomeStatsGrid'
import TodayPlanCard from './components/TodayPlanCard'
import './HomePage.scss'

const DEFAULT_WORKOUT_ID = 'gym-fullbody'

function HomePage() {
  const navigate = useNavigate()
  const { showInfo, showTrainingDays, userProfile, authReady, t } = useAppUI()
  const [dashboard, setDashboard] = useState(null)
  const [selectedDayId, setSelectedDayId] = useState(null)

  useEffect(() => {
    if (!authReady) return
    getDashboard()
      .then(({ data }) => setDashboard(data))
      .catch(() => {})
  }, [authReady])

  const weeklyGoal = dashboard?.weekly_goal ?? {
    target: 3,
    completed: 0,
    days: [],
  }

  const stats = dashboard?.stats
  const kg = t('stats.kg')
  const homeStats = [
    { id: 'weight', label: t('home.statWeight'), value: stats?.current_weight_kg ? `${stats.current_weight_kg} ${kg}` : (userProfile?.weight ? `${userProfile.weight} ${kg}` : '—') },
    { id: 'workouts', label: t('home.statWorkouts'), value: String(stats?.total_workouts ?? userProfile?.workout_count ?? 0) },
    { id: 'activity', label: t('home.statActivity'), value: `${stats?.activity_days ?? 0} ${t('home.daysSuffix')}` },
  ]

  const days = weeklyGoal.days ?? []
  const todayDay = days.find((d) => d.is_today) ?? null
  const selectedDay = days.find((d) => d.id === selectedDayId) ?? todayDay
  const isTodaySelected = selectedDay ? selectedDay.is_today : true

  const selectedPlan = selectedDay
    ? (selectedDay.plan ?? [])
    : (dashboard?.today_plan ?? [])
  const userName = userProfile?.name || userProfile?.display_name || userProfile?.first_name || 'друг'

  const planTitle = !selectedDay || selectedDay.is_today
    ? t('home.planToday')
    : `${t('home.planFor')} · ${selectedDay.label} ${selectedDay.date}`

  return (
    <section className="page page-home">
      <GreetingCard userName={userName} gender={userProfile?.gender} />
      <YourGoalCard
        profile={userProfile}
        currentWeight={stats?.current_weight_kg}
        onClick={() => navigate('/analytics')}
      />
      <GoalCard
        goal={weeklyGoal}
        selectedDayId={selectedDay?.id ?? null}
        onEdit={showTrainingDays}
        onDayClick={(day) => setSelectedDayId(day.id)}
      />
      <HomeStatsGrid
        stats={homeStats}
        onStatClick={(item) => {
          if (item.id === 'weight') navigate('/analytics')
          else if (item.id === 'workouts') navigate('/trainings')
          else showInfo(item.label, item.value)
        }}
      />
      <TodayPlanCard
        title={planTitle}
        items={selectedPlan}
        showStart={isTodaySelected}
        emptyText={isTodaySelected ? t('home.noPlansToday') : t('home.restDay')}
        onStart={() => navigate(`/trainings/${DEFAULT_WORKOUT_ID}`)}
        onItemClick={(item) => {
          if (item.title === 'Питание') navigate('/nutrition')
          else if (item.title === 'Силовая') navigate(`/trainings/${DEFAULT_WORKOUT_ID}`)
          else showInfo(item.title, item.subtitle)
        }}
      />
    </section>
  )
}

export default HomePage
