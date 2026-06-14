function NutritionOverviewCard({ overview, onAction }) {
  const kcalProgress = Math.min(100, Math.round((overview.eaten / overview.calories) * 100))

  return (
    <div className="card nutrition-overview animate-in delay-1">
      <div className="nutrition-overview__header">
        <h2>План на день</h2>
        <button type="button" className="ghost" onClick={() => onAction('Открыт редактирование плана питания')}>
          ✎
        </button>
      </div>

      <p>
        {overview.eaten} / {overview.calories} ккал
      </p>

      <div className="progress-bar">
        <span style={{ width: `${kcalProgress}%` }}></span>
      </div>

      <div className="macro-grid">
        <button type="button" className="macro-card" onClick={() => onAction(`Белки: ${overview.protein.current}/${overview.protein.target}г`)}>
          <span>Белки</span>
          <strong>
            {overview.protein.current}/{overview.protein.target}г
          </strong>
        </button>

        <button type="button" className="macro-card" onClick={() => onAction(`Жиры: ${overview.fats.current}/${overview.fats.target}г`)}>
          <span>Жиры</span>
          <strong>
            {overview.fats.current}/{overview.fats.target}г
          </strong>
        </button>

        <button type="button" className="macro-card" onClick={() => onAction(`Углеводы: ${overview.carbs.current}/${overview.carbs.target}г`)}>
          <span>Углеводы</span>
          <strong>
            {overview.carbs.current}/{overview.carbs.target}г
          </strong>
        </button>

        <button
          type="button"
          className="macro-card"
          onClick={() => onAction(`Вода: ${overview.water.current}/${overview.water.target} л`)}
        >
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
