import { useState } from 'react'
import BottomNav from './components/layout/BottomNav'
import TopStatus from './components/layout/TopStatus'
import {
  ACTIVITY_BY_DAY,
  DAILY_MEALS,
  HOME_STATS,
  HOME_WEEKLY_GOAL,
  INITIAL_CALCULATOR_FORM,
  KNOWLEDGE_ARTICLES,
  KNOWLEDGE_CATEGORIES,
  MEASUREMENTS,
  MOCK_USER,
  NAV_ITEMS,
  NUTRITION_OVERVIEW,
  PROFILE_ACTIONS,
  PROGRESS_PHOTOS,
  RECIPES,
  TRAINING_CATALOG,
  TODAY_PLAN,
  WEIGHT_HISTORY,
} from './data/mockData'
import HomePage from './pages/HomePage/HomePage'
import KnowledgePage from './pages/KnowledgePage/KnowledgePage'
import NutritionPage from './pages/NutritionPage/NutritionPage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import StatsPage from './pages/StatsPage/StatsPage'
import TrainingsPage from './pages/TrainingsPage/TrainingsPage'
import './styles/app-shell.css'

function App() {
  const [activePage, setActivePage] = useState('home')
  const [activeProgressTab, setActiveProgressTab] = useState('dynamics')

  const [calculatorType, setCalculatorType] = useState('tdee')
  const [calculatorForm, setCalculatorForm] = useState(INITIAL_CALCULATOR_FORM)
  const [calculatorResult, setCalculatorResult] = useState('')

  const handleAction = () => {}

  const handleStartSession = () => {}

  const handleCalculatorFieldChange = (field, value) => {
    setCalculatorForm((prev) => ({ ...prev, [field]: value }))
  }

  const calculate = () => {
    const weight = Number(calculatorForm.weight)
    const height = Number(calculatorForm.height)
    const age = Number(calculatorForm.age)
    const activity = Number(calculatorForm.activity)

    if (!weight || !height || !age || !activity) {
      setCalculatorResult('Проверьте поля: вес, рост, возраст и активность обязательны.')
      return
    }

    const bmr =
      calculatorForm.gender === 'male'
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161

    const tdee = Math.round(bmr * activity)

    if (calculatorType === 'tdee') {
      setCalculatorResult(`Поддержание: ${tdee} ккал/день`)
      handleAction('TDEE пересчитан')
      return
    }

    if (calculatorType === 'bmi') {
      const bmi = (weight / ((height / 100) * (height / 100))).toFixed(1)
      setCalculatorResult(`BMI: ${bmi}`)
      handleAction('BMI пересчитан')
      return
    }

    const targetKcal = calculatorForm.goal === 'cut' ? tdee - 300 : calculatorForm.goal === 'bulk' ? tdee + 300 : tdee
    const protein = Math.round(weight * 2)
    const fat = Math.round(weight * 0.8)
    const carbs = Math.round((targetKcal - protein * 4 - fat * 9) / 4)

    setCalculatorResult(`${targetKcal} ккал · Б ${protein}г · Ж ${fat}г · У ${carbs}г`)
    handleAction('Макросы пересчитаны')
  }

  return (
    <div className="app-shell">
      {activePage === 'home' && (
        <TopStatus
          onStreakClick={() => handleAction('Открыта серия тренировок: 12 дней')}
          onPremiumClick={() => handleAction('Открыта покупка подписки Premium')}
        />
      )}

      <main className="screen">
        {activePage === 'home' && (
          <HomePage
            user={MOCK_USER}
            stats={HOME_STATS}
            weeklyGoal={HOME_WEEKLY_GOAL}
            todayPlan={TODAY_PLAN}
            onAction={handleAction}
            onStartSession={handleStartSession}
          />
        )}

        {activePage === 'trainings' && (
          <TrainingsPage
            trainingCatalog={TRAINING_CATALOG}
            onAction={handleAction}
          />
        )}

        {activePage === 'nutrition' && (
          <NutritionPage overview={NUTRITION_OVERVIEW} meals={DAILY_MEALS} recipes={RECIPES} onAction={handleAction} />
        )}

        {activePage === 'knowledge' && (
          <KnowledgePage categories={KNOWLEDGE_CATEGORIES} articles={KNOWLEDGE_ARTICLES} onAction={handleAction} />
        )}

        {activePage === 'analytics' && (
          <StatsPage
            activeTab={activeProgressTab}
            onChangeTab={setActiveProgressTab}
            weightHistory={WEIGHT_HISTORY}
            measurements={MEASUREMENTS}
            photos={PROGRESS_PHOTOS}
            activity={ACTIVITY_BY_DAY}
            onAction={handleAction}
          />
        )}

        {activePage === 'profile' && (
          <ProfilePage
            user={MOCK_USER}
            actions={PROFILE_ACTIONS}
            calculatorType={calculatorType}
            calculatorForm={calculatorForm}
            calculatorResult={calculatorResult}
            onCalculatorTypeChange={setCalculatorType}
            onCalculatorFieldChange={handleCalculatorFieldChange}
            onCalculate={calculate}
            onAction={handleAction}
          />
        )}
      </main>

      <BottomNav
        items={NAV_ITEMS}
        activePage={activePage}
        onChange={(item) => {
          setActivePage(item.key)
          handleAction(`Открыта вкладка: ${item.label}`)
        }}
      />
    </div>
  )
}

export default App
