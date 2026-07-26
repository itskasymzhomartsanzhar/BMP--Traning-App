import { useState } from 'react'
import { FaArrowLeft, FaCheck } from 'react-icons/fa6'
import {
  GENDER_OPTIONS, GOAL_OPTIONS, LEVEL_OPTIONS, PLACE_OPTIONS, INJURY_OPTIONS,
  DAY_OPTIONS, DAYS_BY_LEVEL, STEPS, calcAge, validateStep, buildPayload,
} from './steps'
import './OnboardingPage.scss'

const INITIAL_FORM = {
  name: '',
  birthDate: '',
  gender: '',
  height: '',
  weight: '',
  goal: '',
  level: '',
  place: '',
  injuries: [],
  trainingDays: [],
}

function extractApiError(error) {
  const detail = error.response?.data
  if (detail && typeof detail === 'object') {
    const first = Object.values(detail).flat()[0]
    if (first) return String(first)
  }
  return 'Не удалось сохранить. Попробуйте ещё раз.'
}

/**
 * Шаговый опрос без привязки к способу отправки: onSubmit(payload, form)
 * возвращает промис — авторизованный флоу шлёт анкету в профиль,
 * гостевой — на превью плана.
 */
function OnboardingWizard({ initialName = '', onSubmit, onBackFromFirst, submitLabel = 'Подобрать план' }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [form, setForm] = useState(() => ({ ...INITIAL_FORM, name: initialName }))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const step = STEPS[stepIndex]
  const progress = ((stepIndex + 1) / STEPS.length) * 100

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const toggleInjury = (id) => {
    setForm((prev) => {
      // «Нет травм» — взаимоисключающий с остальными вариантами.
      if (id === 'none') return { ...prev, injuries: prev.injuries.includes('none') ? [] : ['none'] }
      const withoutNone = prev.injuries.filter((i) => i !== 'none')
      const next = withoutNone.includes(id)
        ? withoutNone.filter((i) => i !== id)
        : [...withoutNone, id]
      return { ...prev, injuries: next }
    })
  }

  const goBack = () => {
    if (stepIndex === 0) {
      onBackFromFirst?.()
      return
    }
    setStepIndex((i) => i - 1)
  }

  const toggleDay = (id) => {
    setForm((prev) => ({
      ...prev,
      trainingDays: prev.trainingDays.includes(id)
        ? prev.trainingDays.filter((d) => d !== id)
        : [...prev.trainingDays, id],
    }))
    setErrors((prev) => {
      if (!prev.days) return prev
      const next = { ...prev }
      delete next.days
      return next
    })
  }

  const goNext = () => {
    const stepErrors = validateStep(step, form)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    if (stepIndex < STEPS.length - 1) {
      // Входим на шаг дней впервые — подставляем рекомендацию по уровню.
      if (STEPS[stepIndex + 1] === 'days' && form.trainingDays.length === 0) {
        setForm((prev) => ({ ...prev, trainingDays: DAYS_BY_LEVEL[prev.level] ?? DAYS_BY_LEVEL.intermediate }))
      }
      setStepIndex((i) => i + 1)
      return
    }
    setSaving(true)
    onSubmit(buildPayload(form), form)
      .catch((error) => setErrors({ submit: extractApiError(error) }))
      .finally(() => setSaving(false))
  }

  const age = calcAge(form.birthDate)
  const showBack = stepIndex > 0 || Boolean(onBackFromFirst)

  return (
    <section className="onb">
      <div className="onb__bg" aria-hidden="true" />

      <header className="onb__head">
        {showBack ? (
          <button type="button" className="onb__back" onClick={goBack} aria-label="Назад">
            <FaArrowLeft />
          </button>
        ) : <span className="onb__back-placeholder" />}
        <span className="onb__counter">{stepIndex + 1} / {STEPS.length}</span>
      </header>

      <div className="onb__progress" role="progressbar" aria-valuenow={stepIndex + 1} aria-valuemin={1} aria-valuemax={STEPS.length}>
        <div className="onb__progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="onb__body" key={step}>
        {step === 'name' && (
          <div className="onb__step">
            <h1 className="onb__title">Знакомимся</h1>
            <p className="onb__subtitle">Как к вам обращаться в приложении?</p>
            <input
              className="onb__input"
              type="text"
              autoFocus
              placeholder="Ваше имя"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && goNext()}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <span className="onb__error">{errors.name}</span>}
          </div>
        )}

        {step === 'birth' && (
          <div className="onb__step">
            <h1 className="onb__title">Дата рождения</h1>
            <p className="onb__subtitle">Возраст влияет на интенсивность плана.</p>
            <input
              className="onb__input"
              type="date"
              value={form.birthDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setField('birthDate', e.target.value)}
              aria-invalid={Boolean(errors.birthDate)}
            />
            {age !== null && !errors.birthDate && (
              <p className="onb__hint">Возраст: <strong>{age}</strong></p>
            )}
            {errors.birthDate && <span className="onb__error">{errors.birthDate}</span>}
          </div>
        )}

        {step === 'body' && (
          <div className="onb__step">
            <h1 className="onb__title">Параметры тела</h1>
            <p className="onb__subtitle">Нужны для расчёта нагрузки и калорий.</p>

            <div className="onb__row">
              <label className="onb__field">
                Рост, см
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="180"
                  value={form.height}
                  onChange={(e) => setField('height', e.target.value)}
                  aria-invalid={Boolean(errors.height)}
                />
                {errors.height && <span className="onb__error">{errors.height}</span>}
              </label>

              <label className="onb__field">
                Вес, кг
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  placeholder="75"
                  value={form.weight}
                  onChange={(e) => setField('weight', e.target.value)}
                  aria-invalid={Boolean(errors.weight)}
                />
                {errors.weight && <span className="onb__error">{errors.weight}</span>}
              </label>
            </div>

            <p className="onb__label">Пол</p>
            <div className="onb__chips">
              {GENDER_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`onb-chip${form.gender === o.id ? ' is-selected' : ''}`}
                  onClick={() => setField('gender', o.id)}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {errors.gender && <span className="onb__error">{errors.gender}</span>}
          </div>
        )}

        {step === 'goal' && (
          <div className="onb__step">
            <h1 className="onb__title">Ваша цель</h1>
            <p className="onb__subtitle">По ней подберём программу.</p>
            <div className="onb__cards">
              {GOAL_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`onb-card${form.goal === o.id ? ' is-selected' : ''}`}
                  onClick={() => setField('goal', o.id)}
                >
                  <span className="onb-card__label">{o.label}</span>
                  <span className="onb-card__hint">{o.hint}</span>
                  {form.goal === o.id && <FaCheck className="onb-card__check" />}
                </button>
              ))}
            </div>
            {errors.goal && <span className="onb__error">{errors.goal}</span>}
          </div>
        )}

        {step === 'level' && (
          <div className="onb__step">
            <h1 className="onb__title">Опыт и место</h1>
            <p className="onb__subtitle">Чтобы старт был по силам.</p>

            <p className="onb__label">Уровень подготовки</p>
            <div className="onb__cards">
              {LEVEL_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`onb-card${form.level === o.id ? ' is-selected' : ''}`}
                  onClick={() => setField('level', o.id)}
                >
                  <span className="onb-card__label">{o.label}</span>
                  <span className="onb-card__hint">{o.hint}</span>
                  {form.level === o.id && <FaCheck className="onb-card__check" />}
                </button>
              ))}
            </div>
            {errors.level && <span className="onb__error">{errors.level}</span>}

            <p className="onb__label">Где тренируетесь</p>
            <div className="onb__chips">
              {PLACE_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`onb-chip${form.place === o.id ? ' is-selected' : ''}`}
                  onClick={() => setField('place', o.id)}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {errors.place && <span className="onb__error">{errors.place}</span>}
          </div>
        )}

        {step === 'injuries' && (
          <div className="onb__step">
            <h1 className="onb__title">Травмы и ограничения</h1>
            <p className="onb__subtitle">Исключим опасные для вас упражнения. Можно выбрать несколько.</p>
            <div className="onb__cards onb__cards--compact">
              {INJURY_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`onb-card onb-card--row${form.injuries.includes(o.id) ? ' is-selected' : ''}`}
                  onClick={() => toggleInjury(o.id)}
                >
                  <span className="onb-card__label">{o.label}</span>
                  {form.injuries.includes(o.id) && <FaCheck className="onb-card__check" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'days' && (
          <div className="onb__step">
            <h1 className="onb__title">Дни тренировок</h1>
            <p className="onb__subtitle">
              Мы отметили дни под ваш уровень — поменяйте, как удобно.
              Выбрано: <strong>{form.trainingDays.length}</strong> в неделю.
            </p>
            <div className="onb__chips onb__chips--days">
              {DAY_OPTIONS.map((day) => (
                <button
                  key={day.id}
                  type="button"
                  className={`onb-chip${form.trainingDays.includes(day.id) ? ' is-selected' : ''}`}
                  onClick={() => toggleDay(day.id)}
                >
                  {day.label}
                </button>
              ))}
            </div>
            {errors.days && <span className="onb__error">{errors.days}</span>}
            {errors.submit && <span className="onb__error">{errors.submit}</span>}
          </div>
        )}
      </div>

      <footer className="onb__foot">
        <button
          type="button"
          className="onb__next"
          onClick={goNext}
          disabled={
            saving
            || (step === 'injuries' && form.injuries.length === 0)
            || (step === 'days' && form.trainingDays.length === 0)
          }
        >
          {saving
            ? 'Подбираем план…'
            : stepIndex === STEPS.length - 1
              ? submitLabel
              : 'Далее'}
        </button>
      </footer>
    </section>
  )
}

export default OnboardingWizard
