import { useEffect, useState } from 'react'
import { useAppUI } from '../../context/AppUIContext'
import { getNutritionDay, addWater } from '../../api/nutrition'
import SectionHead from '../../components/common/SectionHead'
import NutritionOverviewCard from './components/NutritionOverviewCard'
import './NutritionPage.scss'

function NutritionPage() {
  const { showToast, t } = useAppUI()
  const [day, setDay] = useState(null)

  useEffect(() => {
    getNutritionDay().then(({ data }) => setDay(data)).catch(() => {})
  }, [])

  const overview = day ? {
    calories: day.target_calories,
    protein: day.target_protein,
    fats: day.target_fats,
    carbs: day.target_carbs,
    water: { current: day.water_liters, target: day.target_water_liters },
  } : null

  const handleWaterAdd = () => {
    const today = new Date().toISOString().slice(0, 10)
    addWater(0.25, today)
      .then(() => getNutritionDay().then(({ data }) => setDay(data)))
      .catch(() => showToast(t('nutrition.waterError')))
  }

  return (
    <section className="page page-nutrition">
      <SectionHead title={t('nutrition.title')} />

      {overview && (
        <NutritionOverviewCard overview={overview} onWaterAdd={handleWaterAdd} />
      )}
    </section>
  )
}

export default NutritionPage
