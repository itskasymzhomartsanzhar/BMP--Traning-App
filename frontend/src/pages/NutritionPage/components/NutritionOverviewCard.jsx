import { useAppUI } from '../../../context/AppUIContext'

function NutritionOverviewCard({ overview, onWaterAdd }) {
  const { t } = useAppUI()
  return (
    <div className="card nutrition-overview animate-in delay-1">
      <div className="nutrition-overview__header">
        <h2>{t('nutrition.dayPlan')}</h2>
      </div>

      <p>{t('nutrition.target', { kcal: overview.calories })}</p>

      <div className="macro-grid">
        <div className="macro-card">
          <span>{t('nutrition.protein')}</span>
          <strong>{overview.protein} {t('nutrition.grams')}</strong>
        </div>

        <div className="macro-card">
          <span>{t('nutrition.fats')}</span>
          <strong>{overview.fats} {t('nutrition.grams')}</strong>
        </div>

        <div className="macro-card">
          <span>{t('nutrition.carbs')}</span>
          <strong>{overview.carbs} {t('nutrition.grams')}</strong>
        </div>

        <button type="button" className="macro-card" onClick={onWaterAdd}>
          <span>{t('nutrition.water')}</span>
          <strong>
            {overview.water.current}/{overview.water.target} л
          </strong>
        </button>
      </div>
    </div>
  )
}

export default NutritionOverviewCard
