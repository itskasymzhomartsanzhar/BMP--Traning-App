import SectionHead from '../../components/common/SectionHead'
import MealsCard from './components/MealsCard'
import NutritionOverviewCard from './components/NutritionOverviewCard'
import RecipesCard from './components/RecipesCard'
import './NutritionPage.css'

function NutritionPage({ overview, meals, recipes, onAction }) {
  return (
    <section className="page page-nutrition">
      <SectionHead
        title="Питание"
        icon="nutrition"
        iconMessage="Питание"
        onIconClick={() => onAction('Открыт фильтр по рациону')}
      />

      <NutritionOverviewCard overview={overview} onAction={onAction} />
      <MealsCard meals={meals} onAction={onAction} />
      <RecipesCard recipes={recipes} onAction={onAction} />
    </section>
  )
}

export default NutritionPage
