import { useMemo, useState } from 'react'
import Modal from '../../../components/organisms/Modal/Modal'
import { useAppUI } from '../../../context/AppUIContext'
import './PersonalDataModal.scss'

const GENDER_OPTIONS = ['Мужской', 'Женский']
const GOAL_OPTIONS = ['Сушка', 'Рекомп', 'Набор']

const GENDER_FROM_API = { male: 'Мужской', female: 'Женский' }
// Прочие цели (поддержание, выносливость) в списке нет — при
// редактировании пользователь выберет одну из трёх.
const GOAL_FROM_API = { cut: 'Сушка', recomp: 'Рекомп', bulk: 'Набор' }

function toInputValue(value) {
  return value === undefined || value === null ? '' : String(value)
}

// Вес и рост здесь не редактируются: вес — замерами на странице
// Аналитика, рост — кнопкой «Изменить рост» там же.
function validatePersonalData(form, t) {
  const nextErrors = {}
  if (!form.name.trim()) nextErrors.name = t('profile.nameError')
  if (!form.gender) nextErrors.gender = t('profile.genderError')
  if (!form.goal) nextErrors.goal = t('profile.goalError')
  return nextErrors
}

function PersonalDataModal({ user, onSave, onClose }) {
  const { t, language } = useAppUI()
  const initialForm = useMemo(() => ({
    name: toInputValue(user?.name || user?.display_name || user?.first_name),
    gender: toInputValue(GENDER_FROM_API[user?.gender] || user?.gender_display || user?.gender),
    goal: toInputValue(GOAL_FROM_API[user?.goal] || ''),
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
    const nextErrors = validatePersonalData(form, t)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSave({
      name: form.name.trim(),
      gender: form.gender,
      goal: form.goal,
    })
  }

  return (
    <Modal title={t('profile.personal')} onClose={onClose} className="personal-modal">
      <form className="personal-form" onSubmit={submit} noValidate>
        <div className="personal-form__grid">
          <label className="personal-form__field personal-form__field--wide">
            {t('profile.name')}
            <input type="text" value={form.name} onChange={(e) => setField('name', e.target.value)} aria-invalid={Boolean(errors.name)} />
            {errors.name ? <span className="personal-form__error">{errors.name}</span> : null}
          </label>

          <label className="personal-form__field">
            {t('profile.gender')}
            <select value={form.gender} onChange={(e) => setField('gender', e.target.value)} aria-invalid={Boolean(errors.gender)}>
              <option value="">{t('profile.choose')}</option>
              {GENDER_OPTIONS.map((o) => <option key={o} value={o}>{language === 'en' ? (o === 'Мужской' ? t('profile.male') : t('profile.female')) : o}</option>)}
            </select>
            {errors.gender ? <span className="personal-form__error">{errors.gender}</span> : null}
          </label>

          <label className="personal-form__field">
            {t('profile.goal')}
            <select value={form.goal} onChange={(e) => setField('goal', e.target.value)} aria-invalid={Boolean(errors.goal)}>
              <option value="">{t('profile.choose')}</option>
              {GOAL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            {errors.goal ? <span className="personal-form__error">{errors.goal}</span> : null}
          </label>
        </div>

        <div className="personal-form__actions">
          <button type="button" className="secondary" onClick={onClose}>{t('common.cancel')}</button>
          <button type="submit" className="primary">{t('common.save')}</button>
        </div>
      </form>
    </Modal>
  )
}

export default PersonalDataModal
