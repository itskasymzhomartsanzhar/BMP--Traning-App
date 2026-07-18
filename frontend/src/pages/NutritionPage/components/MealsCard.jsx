function MealsCard({ meals, onMealClick, onAddMeal }) {
  return (
    <div className="card nutrition-meals animate-in delay-2">
      <h2>Приемы пищи</h2>

      <div className="meal-list">
        {meals.map((meal) => (
          <button
            key={meal.id}
            type="button"
            className="meal-row"
            onClick={() => onMealClick?.(meal)}
          >
            <div>
              <strong>{meal.title}</strong>
              <p>{meal.time}</p>
            </div>
            <div className="meal-row__right">
              <span>{meal.kcal} ккал</span>
              <small>{meal.status}</small>
            </div>
          </button>
        ))}
      </div>

      <button type="button" className="primary" onClick={onAddMeal}>
        Добавить прием пищи
      </button>
    </div>
  )
}

export default MealsCard
