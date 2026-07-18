import { useMemo, useState } from 'react'
import Modal from '../../../components/organisms/Modal/Modal'
import './PersonalDataModal.scss'

const GENDER_OPTIONS = ['Мужской', 'Женский', 'Другое']
const GOAL_OPTIONS = ['Сушка', 'Набор массы', 'Поддержание', 'Выносливость', 'Рекомпозиция']

const GENDER_FROM_API = { male: 'Мужской', female: 'Женский', other: 'Другое' }
const GOAL_FROM_API = { cut: 'Сушка', bulk: 'Набор массы', maintain: 'Поддержание', endurance: 'Выносливость', recomp: 'Рекомпозиция' }

function toInputValue(value) {
  return value === undefined || value === null ? '' : String(value)
}

function parsePositiveNumber(value) {
  return Number(String(value).replace(',', '.'))
}

function validatePersonalData(form) {
  const nextErrors = {}
  const name = form.name.trim()
  const email = form.email.trim()
  const weight = parsePositiveNumber(form.weight)
  const height = parsePositiveNumber(form.height)

  if (!name) nextErrors.name = 'Укажите имя'
  if (!email) {
    nextErrors.email = 'Укажите email'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    nextErrors.email = 'Введите корректный email'
  }
  if (!Number.isFinite(weight) || weight < 20 || weight > 300) nextErrors.weight = 'Вес должен быть от 20 до 300 кг'
  if (!Number.isFinite(height) || height < 80 || height > 250) nextErrors.height = 'Рост должен быть от 80 до 250 см'
  if (!form.gender) nextErrors.gender = 'Выберите пол'
  if (!form.goal) nextErrors.goal = 'Выберите цель'

  return nextErrors
}

function PersonalDataModal({ user, onSave, onClose }) {
  const initialForm = useMemo(() => ({
    name: toInputValue(user?.name || user?.display_name || user?.first_name),
    email: toInputValue(user?.email),
    gender: toInputValue(GENDER_FROM_API[user?.gender] || user?.gender_display || user?.gender),
    weight: toInputValue(user?.weight),
    height: toInputValue(user?.height),
    goal: toInputValue(GOAL_FROM_API[user?.goal] || user?.goal_display || user?.goal),
  }), [user])

  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const submit = (event) => {
    event.preventDefault()
    const nextErrors = validatePersonalData(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSave({
      name: form.name.trim(),
      email: form.email.trim(),
      gender: form.gender,
      weight: Number(parsePositiveNumber(form.weight).toFixed(1)),
      height: Math.round(parsePositiveNumber(form.height)),
      goal: form.goal,
    })
  }

  return (
    <Modal title="Личные данные" onClose={onClose} className="personal-modal">
      <form className="personal-form" onSubmit={submit} noValidate>
        <div className="personal-form__grid">
          <label className="personal-form__field personal-form__field--wide">
            Имя
            <input type="text" value={form.name} onChange={(e) => setField('name', e.target.value)} aria-invalid={Boolean(errors.name)} />
            {errors.name ? <span className="personal-form__error">{errors.name}</span> : null}
          </label>

          <label className="personal-form__field personal-form__field--wide">
            Email
            <input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} aria-invalid={Boolean(errors.email)} />
            {errors.email ? <span className="personal-form__error">{errors.email}</span> : null}
          </label>

          <label className="personal-form__field">
            Вес, кг
            <input type="number" inputMode="decimal" min="20" max="300" step="0.1" value={form.weight} onChange={(e) => setField('weight', e.target.value)} aria-invalid={Boolean(errors.weight)} />
            {errors.weight ? <span className="personal-form__error">{errors.weight}</span> : null}
          </label>

          <label className="personal-form__field">
            Рост, см
            <input type="number" inputMode="numeric" min="80" max="250" step="1" value={form.height} onChange={(e) => setField('height', e.target.value)} aria-invalid={Boolean(errors.height)} />
            {errors.height ? <span className="personal-form__error">{errors.height}</span> : null}
          </label>

          <label className="personal-form__field">
            Пол
            <select value={form.gender} onChange={(e) => setField('gender', e.target.value)} aria-invalid={Boolean(errors.gender)}>
              <option value="">Выберите</option>
              {GENDER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            {errors.gender ? <span className="personal-form__error">{errors.gender}</span> : null}
          </label>

          <label className="personal-form__field">
            Цель
            <select value={form.goal} onChange={(e) => setField('goal', e.target.value)} aria-invalid={Boolean(errors.goal)}>
              <option value="">Выберите</option>
              {GOAL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            {errors.goal ? <span className="personal-form__error">{errors.goal}</span> : null}
          </label>
        </div>

        <div className="personal-form__actions">
          <button type="button" className="secondary" onClick={onClose}>Отмена</button>
          <button type="submit" className="primary">Сохранить</button>
        </div>
      </form>
    </Modal>
  )
}

export default PersonalDataModal
