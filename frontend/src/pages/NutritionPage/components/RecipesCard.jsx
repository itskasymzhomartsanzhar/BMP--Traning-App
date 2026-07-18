function RecipesCard({ recipes, onRecipeClick }) {
  return (
    <div className="card nutrition-recipes animate-in delay-3">
      <h2>Рецепты</h2>

      <div className="recipe-list">
        {recipes.map((recipe) => (
          <button
            key={recipe.id}
            type="button"
            className="recipe-row"
            onClick={() => onRecipeClick?.(recipe)}
          >
            <div>
              <strong>{recipe.title}</strong>
              <p>{recipe.macros}</p>
            </div>
            <span>{recipe.calories}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default RecipesCard
