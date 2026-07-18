import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BackHeader from '../../components/organisms/BackHeader/BackHeader'
import { getRecipe } from '../../api/nutrition'
import './RecipePage.scss'

function RecipePage() {
  const { recipeId } = useParams()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    getRecipe(recipeId)
      .then(({ data }) => setRecipe(data))
      .catch(() => setNotFound(true))
  }, [recipeId])

  if (notFound) {
    return (
      <section className="page">
        <BackHeader title="Рецепт не найден" onBack={() => navigate('/nutrition')} />
      </section>
    )
  }

  if (!recipe) {
    return (
      <section className="page page-recipe">
        <BackHeader title="Загрузка..." onBack={() => navigate('/nutrition')} />
      </section>
    )
  }

  return (
    <section className="page page-recipe">
      <BackHeader title={recipe.title} subtitle={`${recipe.calories_display} · ${recipe.time}`} onBack={() => navigate('/nutrition')} />

      <div className="card animate-in">
        <p className="recipe-macros">{recipe.macros}</p>
        <h2>Ингредиенты</h2>
        <ul className="recipe-list-items">
          {recipe.ingredients.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="card animate-in delay-1">
        <h2>Приготовление</h2>
        <ol className="recipe-steps">
          {recipe.steps.map((step, i) => (
            <li key={step}>
              <span>{i + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default RecipePage
