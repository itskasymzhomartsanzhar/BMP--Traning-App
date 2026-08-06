import { useEffect, useState } from 'react'
import { FaXmark, FaCalculator } from 'react-icons/fa6'
import { useAppUI } from '../../../context/AppUIContext'
import { getWeightHistory } from '../../../api/analytics'
import './CalculatorModal.scss'

// Цели профиля шире, чем режимы калькулятора — сводим к трём.
const GOAL_TO_CALC = { cut: 'cut', bulk: 'bulk', maintain: 'maintain', endurance: 'maintain', recomp: 'maintain' }

// Единственный режим — расчёт КБЖУ (macros).
function CalculatorModal({ onClose }) {
  const { userProfile, u, t } = useAppUI()
  const type = 'macros'
  // По умолчанию — данные из опроса/профиля; вес уточняется свежим замером ниже.
  // В форме — выбранная система измерения, расчёт всегда в метрике.
  const [form, setForm] = useState(() => ({
    weight: userProfile?.weight != null ? String(u.weight(userProfile.weight)) : '',
    height: userProfile?.height != null ? String(u.length(userProfile.height)) : '',
    age: userProfile?.age != null ? String(userProfile.age) : '',
    activity: '1.55',
    goal: GOAL_TO_CALC[userProfile?.goal] || 'maintain',
    gender: userProfile?.gender === 'female' ? 'female' : 'male',
  }))
  const [result, setResult] = useState(null)

  useEffect(() => {
    // Актуальный вес — последний замер; профиль в контексте мог устареть за сессию.
    getWeightHistory()
      .then(({ data }) => {
        const last = Array.isArray(data) && data.length > 0 ? data[data.length - 1] : null
        if (last?.value) {
          setForm((prev) => ({ ...prev, weight: String(u.weight(last.value)) }))
        }
      })
      .catch(() => {})
  }, [u])

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const calculate = () => {
    const weight = u.weightToKg(Number(form.weight))
    const height = u.lengthToCm(Number(form.height))
    const age = Number(form.age)
    const activity = Number(form.activity)
    if (!weight || !height || !age || !activity) {
      setResult({ error: t('calc.fillAll') })
      return
    }

    const bmr =
      form.gender === 'male'
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161

    const tdee = Math.round(bmr * activity)

    const targetKcal =
      form.goal === 'cut' ? tdee - 300 : form.goal === 'bulk' ? tdee + 300 : tdee
    const protein = Math.round(weight * 2)
    const fat = Math.round(weight * 0.8)
    const carbs = Math.round((targetKcal - protein * 4 - fat * 9) / 4)
    setResult({
      label: t('calc.macros'),
      value: `${targetKcal} ${t('home.kcal')}`,
      macros: [
        { label: t('nutrition.protein'), value: `${protein} ${t('nutrition.grams')}` },
        { label: t('nutrition.fats'), value: `${fat} ${t('nutrition.grams')}` },
        { label: t('nutrition.carbs'), value: `${carbs} ${t('nutrition.grams')}` },
      ],
    })
  }

  return (
    <div className="calc-overlay" role="presentation" onClick={onClose}>
      <div
        className="calc-sheet"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="calc-sheet__head">
          <div className="calc-sheet__title">
            <FaCalculator />
            <h2>{t('nutrition.calculator')}</h2>
          </div>
          <button type="button" className="calc-close" onClick={onClose} aria-label={t('common.close')}>
            <FaXmark />
          </button>
        </div>

        <div className="calc-grid">
          <label>
            {t('home.statWeight')} ({u.weightLabel})
            <input
              type="number"
              value={form.weight}
              onChange={(e) => setField('weight', e.target.value)}
            />
          </label>
          <label>
            {t('home.height')} ({u.lengthLabel})
            <input
              type="number"
              value={form.height}
              onChange={(e) => setField('height', e.target.value)}
            />
          </label>
          <label>
            {t('calc.age')}
            <input
              type="number"
              value={form.age}
              onChange={(e) => setField('age', e.target.value)}
            />
          </label>
          <label>
            {t('calc.activity')}
            <select value={form.activity} onChange={(e) => setField('activity', e.target.value)}>
              <option value="1.2">{t('calc.actLow')}</option>
              <option value="1.375">{t('calc.actLight')}</option>
              <option value="1.55">{t('calc.actMedium')}</option>
              <option value="1.725">{t('calc.actHigh')}</option>
              <option value="1.9">{t('calc.actVeryHigh')}</option>
            </select>
          </label>
          <label>
            {t('profile.gender')}
            <select value={form.gender} onChange={(e) => setField('gender', e.target.value)}>
              <option value="male">{t('profile.male')}</option>
              <option value="female">{t('profile.female')}</option>
            </select>
          </label>
          {type === 'macros' && (
            <label>
              {t('profile.goal')}
              <select value={form.goal} onChange={(e) => setField('goal', e.target.value)}>
                <option value="cut">{t('calc.goalCut')}</option>
                <option value="maintain">{t('goals.maintain')}</option>
                <option value="bulk">{t('calc.goalBulk')}</option>
              </select>
            </label>
          )}
        </div>

        <button type="button" className="primary" onClick={calculate}>
          {t('calc.calculate')}
        </button>

        {result && (
          <div className="calc-result-box">
            {result.error ? (
              <p className="calc-result-box__error">{result.error}</p>
            ) : (
              <>
                <span className="calc-result-box__label">{result.label}</span>
                <strong className="calc-result-box__value">{result.value}</strong>
                {result.sub && <p className="calc-result-box__sub">{result.sub}</p>}
                {result.macros && (
                  <div className="calc-result-box__macros">
                    {result.macros.map((m) => (
                      <div key={m.label} className="calc-result-box__macro">
                        <span>{m.label}</span>
                        <strong>{m.value}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CalculatorModal
