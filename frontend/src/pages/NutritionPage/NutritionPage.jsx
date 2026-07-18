import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppUI } from '../../context/AppUIContext'
import { getNutritionDay, getRecipes, updateMeal, addWater, createMeal } from '../../api/nutrition'
import SectionHead from '../../components/common/SectionHead'
import MealsCard from './components/MealsCard'
import NutritionOverviewCard from './components/NutritionOverviewCard'
import RecipesCard from './components/RecipesCard'
import './NutritionPage.scss'

function NutritionPage() {
  const navigate = useNavigate()
  const { showInfo, showModal, showToast } = useAppUI()
  const [day, setDay] = useState(null)
  const [recipes, setRecipes] = useState([])

  useEffect(() => {
    getNutritionDay().then(({ data }) => setDay(data)).catch(() => {})
    getRecipes().then(({ data }) => setRecipes(data)).catch(() => {})
  }, [])

  const overview = day ? {
    calories: day.target_calories,
    eaten: day.eaten_calories,
    protein: { current: day.eaten_protein, target: day.target_protein },
    fats: { current: day.eaten_fats, target: day.target_fats },
    carbs: { current: day.eaten_carbs, target: day.target_carbs },
    water: { current: day.water_liters, target: day.target_water_liters },
  } : null

  const meals = day?.meals ?? []

  const handleMealClick = (meal) => {
    showModal({
      title: meal.title,
      message: `${meal.time} · ${meal.kcal} ккал · ${meal.status_display}`,
      actions: [
        { label: 'Закрыть', variant: 'secondary', onClick: () => {} },
        {
          label: meal.status === 'planned' ? 'Отметить съеденным' : 'Вернуть в план',
          variant: 'primary',
          onClick: () => {
            const newStatus = meal.status === 'planned' ? 'eaten' : 'planned'
            updateMeal(meal.id, { status: newStatus })
              .then(() => getNutritionDay().then(({ data }) => setDay(data)))
              .catch(() => showToast('Ошибка обновления'))
          },
        },
      ],
    })
  }

  const handleAddMeal = () => {
    const addMeal = (type, title, time) => {
      const today = new Date().toISOString().slice(0, 10)
      createMeal({ type, title, time, kcal: 0, date: today })
        .then(() => getNutritionDay().then(({ data }) => setDay(data)))
        .catch(() => showToast('Не удалось добавить приём пищи'))
    }

    showModal({
      title: 'Добавить приём пищи',
      message: 'Выберите тип приёма:',
      actions: [
        { label: 'Завтрак', variant: 'secondary', onClick: () => addMeal('breakfast', 'Завтрак', '08:00') },
        { label: 'Обед', variant: 'secondary', onClick: () => addMeal('lunch', 'Обед', '13:00') },
        { label: 'Перекус', variant: 'secondary', onClick: () => addMeal('snack', 'Перекус', '16:00') },
        { label: 'Ужин', variant: 'primary', onClick: () => addMeal('dinner', 'Ужин', '19:00') },
      ],
    })
  }

  const handleWaterAdd = () => {
    const today = new Date().toISOString().slice(0, 10)
    addWater(0.25, today)
      .then(() => getNutritionDay().then(({ data }) => setDay(data)))
      .catch(() => showToast('Не удалось добавить воду'))
  }

  return (
    <section className="page page-nutrition">
      <SectionHead title="Питание" />

      {overview && (
        <NutritionOverviewCard
          overview={overview}
          onWaterAdd={handleWaterAdd}
          onMacroClick={(label) => showInfo(label, 'Детальная статистика макросов.')}
        />
      )}

      <MealsCard
        meals={meals}
        onMealClick={handleMealClick}
        onAddMeal={handleAddMeal}
      />

      <RecipesCard recipes={recipes} onRecipeClick={(r) => navigate(`/recipe/${r.id}`)} />
    </section>
  )
}

export default NutritionPage
