import { useAppUI } from '../../../context/AppUIContext'
import menFigure from '../../../assets/men.png'
import womenFigure from '../../../assets/women.png'

// Та же формула, что в калькуляторе питания: Миффлин-Сан Жеор,
// активность 1.55, дефицит/профицит 300 ккал под цель.
function calcMacros(profile, weight) {
  const height = Number(profile?.height)
  const age = Number(profile?.age)
  if (!Number.isFinite(weight) || !Number.isFinite(height) || !Number.isFinite(age) || !height || !age) {
    return null
  }
  const bmr = profile?.gender === 'female'
    ? 10 * weight + 6.25 * height - 5 * age - 161
    : 10 * weight + 6.25 * height - 5 * age + 5
  const tdee = bmr * 1.55
  const kcal = Math.round(
    profile?.goal === 'cut' ? tdee - 300 : profile?.goal === 'bulk' ? tdee + 300 : tdee,
  )
  const protein = Math.round(weight * 2)
  const fat = Math.round(weight * 0.8)
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4))
  return { kcal, protein, fat, carbs }
}

/**
 * Блок «Твоя цель»: фигура по полу слева, вес / КБЖУ / рост справа,
 * снизу цель из анкеты. Все цифры считаются из профиля.
 */
const GOAL_IDS = ['cut', 'bulk', 'maintain', 'endurance', 'recomp']

function YourGoalCard({ profile, currentWeight, onClick }) {
  const { t, u } = useAppUI()
  const weight = Number(currentWeight ?? profile?.weight)
  const height = Number(profile?.height)

  const goal = GOAL_IDS.includes(profile?.goal)
    ? { label: t(`goals.${profile.goal}`), hint: t(`goalHints.${profile.goal}`) }
    : { label: t('home.goal'), hint: t('home.fillSurvey') }
  const macros = calcMacros(profile, weight)
  const figure = profile?.gender === 'female' ? womenFigure : menFigure

  return (
    <button type="button" className="your-goal card animate-in delay-1" onClick={onClick}>
      <div className="your-goal__head">
        <h2>{t('home.yourGoal')}</h2>
      </div>


      <div className="your-goal__body">
        <div className="your-goal__figure">
          <img src={figure} alt="" aria-hidden="true" />
        </div>

        <div className="your-goal__stats">
          <div className="your-goal__cell">
            <span>{t('home.weightNow')}</span>
            <strong>{Number.isFinite(weight) ? u.fmtWeight(weight) : '—'}</strong>
          </div>
          <div className="your-goal__cell">
            <span>{t('home.dailyMacros')}</span>
            <strong>{macros ? `${macros.kcal} ${t('home.kcal')}` : '—'}</strong>
            {macros && <em>{t('home.macrosShort', { p: macros.protein, f: macros.fat, c: macros.carbs })}</em>}
          </div>
          <div className="your-goal__cell">
            <span>{t('home.height')}</span>
            <strong>{u.fmtHeight(height)}</strong>
          </div>
        </div>
      </div>

      <div className="your-goal__foot">
        <div className="your-goal__cell">
          <span>{t('home.goal')}</span>
          <strong>{goal.label}</strong>
          <em>{goal.hint}</em>
        </div>
      </div>
    </button>
  )
}

export default YourGoalCard
