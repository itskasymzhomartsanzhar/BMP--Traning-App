import menFigure from '../../../assets/men.png'
import womenFigure from '../../../assets/women.png'

const LEVEL_NUM = { beginner: 1, intermediate: 2, advanced: 3 }

const GOAL_META = {
  cut: { label: 'Сушка', hint: 'талия + дефицит без срыва' },
  bulk: { label: 'Набор массы', hint: 'профицит + сила без жира' },
  maintain: { label: 'Поддержание', hint: 'форма и тонус каждый день' },
  endurance: { label: 'Выносливость', hint: 'больше энергии и дыхалки' },
  recomp: { label: 'Рекомпозиция', hint: 'меньше жира, больше мышц' },
}

function bmiCategory(bmi) {
  if (bmi < 18.5) return 'дефицит'
  if (bmi < 25) return 'норма'
  if (bmi < 30) return 'избыток'
  return 'высокий избыток'
}

// Ориентир — направление без жёстких цифр: до границы нормы BMI, с мягким шагом.
function buildTarget(goal, weight, height, bmi) {
  const canCalc = Number.isFinite(weight) && Number.isFinite(bmi)
  const heightM = height / 100

  if (goal === 'cut') {
    if (!canCalc) return { value: 'Минус вес', hint: 'плавный дефицит' }
    const normalWeight = 24.9 * heightM * heightM
    const diff = Math.max(0, weight - normalWeight)
    const step = diff > 0 ? Math.min(Math.round(diff), Math.max(2, Math.round(weight * 0.1))) : 2
    return { value: `Минус ${step} кг`, hint: 'без цифры на скорость' }
  }
  if (goal === 'bulk') {
    if (!canCalc) return { value: 'Плюс вес', hint: 'чистый набор' }
    const step = Math.max(2, Math.min(8, Math.round(weight * 0.07)))
    return { value: `Плюс ${step} кг`, hint: 'чистый набор' }
  }
  if (goal === 'recomp') return { value: 'Вес на месте', hint: 'состав тела меняем' }
  if (goal === 'endurance') return { value: 'Темп и объём', hint: 'вес вторичен' }
  return { value: 'Держать вес', hint: 'стабильность решает' }
}

/**
 * Блок «Твоя цель»: фигура по полу слева, вес / BMI / рост справа,
 * снизу цель из анкеты и ориентир. Все цифры считаются из профиля.
 */
function YourGoalCard({ profile, currentWeight, onClick }) {
  const weight = Number(currentWeight ?? profile?.weight)
  const height = Number(profile?.height)
  const hasBody = Number.isFinite(weight) && Number.isFinite(height) && height > 0

  const bmi = hasBody ? weight / ((height / 100) ** 2) : NaN
  const goal = GOAL_META[profile?.goal] ?? { label: 'Цель', hint: 'заполните анкету' }
  const target = buildTarget(profile?.goal, weight, height, bmi)
  const level = LEVEL_NUM[profile?.level] ?? 1
  const figure = profile?.gender === 'female' ? womenFigure : menFigure

  return (
    <button type="button" className="your-goal card animate-in delay-1" onClick={onClick}>
      <div className="your-goal__head">
        <h2>Твоя цель</h2>
        <span className="your-goal__badge">реалистично</span>
      </div>
      <p className="your-goal__subtitle">
        Маршрут по анкете: цель, темп, тренировки и питание в одной логике.
      </p>

      <div className="your-goal__body">
        <div className="your-goal__figure">
          <span className="your-goal__level">Lv. {level}</span>
          <img src={figure} alt="" aria-hidden="true" />
        </div>

        <div className="your-goal__stats">
          <div className="your-goal__cell">
            <span>Вес сейчас</span>
            <strong>{Number.isFinite(weight) ? `${weight.toFixed(1)} кг` : '—'}</strong>
          </div>
          <div className="your-goal__cell">
            <span>BMI</span>
            <strong>{hasBody ? bmi.toFixed(1) : '—'}</strong>
            {hasBody && <em>{bmiCategory(bmi)}</em>}
          </div>
          <div className="your-goal__cell">
            <span>Рост</span>
            <strong>{Number.isFinite(height) ? `${height} см` : '—'}</strong>
          </div>
        </div>
      </div>

      <div className="your-goal__foot">
        <div className="your-goal__cell">
          <span>Цель</span>
          <strong>{goal.label}</strong>
          <em>{goal.hint}</em>
        </div>
        <div className="your-goal__cell">
          <span>Ориентир</span>
          <strong>{target.value}</strong>
          <em>{target.hint}</em>
        </div>
      </div>
    </button>
  )
}

export default YourGoalCard
