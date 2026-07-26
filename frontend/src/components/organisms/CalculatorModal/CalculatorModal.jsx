import { useEffect, useState } from 'react'
import { FaXmark, FaCalculator } from 'react-icons/fa6'
import { useAppUI } from '../../../context/AppUIContext'
import { getWeightHistory } from '../../../api/analytics'
import './CalculatorModal.scss'

// Цели профиля шире, чем режимы калькулятора — сводим к трём.
const GOAL_TO_CALC = { cut: 'cut', bulk: 'bulk', maintain: 'maintain', endurance: 'maintain', recomp: 'maintain' }

function CalculatorModal({ onClose }) {
  const { userProfile } = useAppUI()
  const [type, setType] = useState('tdee')
  // По умолчанию — данные из опроса/профиля; вес уточняется свежим замером ниже.
  const [form, setForm] = useState(() => ({
    weight: userProfile?.weight != null ? String(userProfile.weight) : '',
    height: userProfile?.height != null ? String(userProfile.height) : '',
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
          setForm((prev) => ({ ...prev, weight: String(last.value) }))
        }
      })
      .catch(() => {})
  }, [])

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const calculate = () => {
    const weight = Number(form.weight)
    const height = Number(form.height)
    const age = Number(form.age)
    const activity = Number(form.activity)
    if (!weight || !height || !age || !activity) {
      setResult({ error: 'Заполните все поля' })
      return
    }

    const bmr =
      form.gender === 'male'
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161

    const tdee = Math.round(bmr * activity)

    if (type === 'bmi') {
      const bmi = (weight / ((height / 100) ** 2)).toFixed(1)
      const bmiLabel =
        bmi < 18.5 ? 'Дефицит' : bmi < 25 ? 'Норма' : bmi < 30 ? 'Избыточный' : 'Ожирение'
      setResult({ label: 'BMI', value: bmi, sub: bmiLabel })
      return
    }

    if (type === 'tdee') {
      setResult({ label: 'TDEE', value: `${tdee} ккал`, sub: 'поддержание веса' })
      return
    }

    const targetKcal =
      form.goal === 'cut' ? tdee - 300 : form.goal === 'bulk' ? tdee + 300 : tdee
    const protein = Math.round(weight * 2)
    const fat = Math.round(weight * 0.8)
    const carbs = Math.round((targetKcal - protein * 4 - fat * 9) / 4)
    setResult({
      label: 'Макросы',
      value: `${targetKcal} ккал`,
      macros: [
        { label: 'Белки', value: `${protein} г` },
        { label: 'Жиры', value: `${fat} г` },
        { label: 'Углеводы', value: `${carbs} г` },
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
            <h2>Калькулятор</h2>
          </div>
          <button type="button" className="calc-close" onClick={onClose} aria-label="Закрыть">
            <FaXmark />
          </button>
        </div>

        <div className="tab-row compact">
          {['tdee', 'bmi', 'macros'].map((t) => (
            <button
              key={t}
              type="button"
              className={type === t ? 'tab is-active' : 'tab'}
              onClick={() => { setType(t); setResult(null) }}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="calc-grid">
          <label>
            Вес (кг)
            <input
              type="number"
              value={form.weight}
              onChange={(e) => setField('weight', e.target.value)}
            />
          </label>
          <label>
            Рост (см)
            <input
              type="number"
              value={form.height}
              onChange={(e) => setField('height', e.target.value)}
            />
          </label>
          <label>
            Возраст
            <input
              type="number"
              value={form.age}
              onChange={(e) => setField('age', e.target.value)}
            />
          </label>
          <label>
            Активность
            <select value={form.activity} onChange={(e) => setField('activity', e.target.value)}>
              <option value="1.2">Низкая</option>
              <option value="1.375">Лёгкая</option>
              <option value="1.55">Средняя</option>
              <option value="1.725">Высокая</option>
              <option value="1.9">Очень высокая</option>
            </select>
          </label>
          <label>
            Пол
            <select value={form.gender} onChange={(e) => setField('gender', e.target.value)}>
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </select>
          </label>
          {type === 'macros' && (
            <label>
              Цель
              <select value={form.goal} onChange={(e) => setField('goal', e.target.value)}>
                <option value="cut">Сушка −300 ккал</option>
                <option value="maintain">Поддержание</option>
                <option value="bulk">Набор +300 ккал</option>
              </select>
            </label>
          )}
        </div>

        <button type="button" className="primary" onClick={calculate}>
          Рассчитать
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
