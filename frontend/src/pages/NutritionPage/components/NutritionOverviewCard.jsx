function NutritionOverviewCard({ overview, onWaterAdd, onMacroClick }) {
  const kcalProgress = Math.min(100, Math.round((overview.eaten / overview.calories) * 100))

  return (
    <div className="card nutrition-overview animate-in delay-1">
      <div className="nutrition-overview__header">
        <h2>План на день</h2>
        <button type="button" className="ghost" onClick={() => onMacroClick?.('План питания')}>
          ✎
        </button>
      </div>

      <p>
        {overview.eaten} / {overview.calories} ккал
      </p>

      <div className="progress-bar">
        <span style={{ width: `${kcalProgress}%` }} />
      </div>

      <div className="macro-grid">
        <button type="button" className="macro-card" onClick={() => onMacroClick?.('Белки')}>
          <span>Белки</span>
          <strong>
            {overview.protein.current}/{overview.protein.target}г
          </strong>
        </button>

        <button type="button" className="macro-card" onClick={() => onMacroClick?.('Жиры')}>
          <span>Жиры</span>
          <strong>
            {overview.fats.current}/{overview.fats.target}г
          </strong>
        </button>

        <button type="button" className="macro-card" onClick={() => onMacroClick?.('Углеводы')}>
          <span>Углеводы</span>
          <strong>
            {overview.carbs.current}/{overview.carbs.target}г
          </strong>
        </button>

        <button type="button" className="macro-card" onClick={onWaterAdd}>
          <span>Вода</span>
          <strong>
            {overview.water.current}/{overview.water.target} л
          </strong>
        </button>
      </div>
    </div>
  )
}

export default NutritionOverviewCard
