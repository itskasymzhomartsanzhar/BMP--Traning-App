// Опции шагов: подписи — ключи переводов (labelKey/hintKey),
// рендер переводит их через t() из контекста.

export const GENDER_OPTIONS = [
  { id: 'male', labelKey: 'profile.male' },
  { id: 'female', labelKey: 'profile.female' },
]

export const GOAL_OPTIONS = [
  { id: 'cut', labelKey: 'onb.goalCut', hintKey: 'onb.goalCutHint' },
  { id: 'recomp', labelKey: 'onb.goalRecomp', hintKey: 'onb.goalRecompHint' },
  { id: 'bulk', labelKey: 'onb.goalBulk', hintKey: 'onb.goalBulkHint' },
]

export const LEVEL_OPTIONS = [
  { id: 'beginner', labelKey: 'onb.levelBeginner', hintKey: 'onb.levelBeginnerHint' },
  { id: 'intermediate', labelKey: 'onb.levelIntermediate', hintKey: 'onb.levelIntermediateHint' },
  { id: 'advanced', labelKey: 'onb.levelAdvanced', hintKey: 'onb.levelAdvancedHint' },
  { id: 'custom', labelKey: 'onb.levelCustom', hintKey: 'onb.levelCustomHint' },
]

export const PLACE_OPTIONS = [
  { id: 'gym', labelKey: 'onb.placeGym' },
  { id: 'home', labelKey: 'onb.placeHome' },
]

export const INJURY_OPTIONS = [
  { id: 'none', labelKey: 'onb.injNone' },
  { id: 'knee', labelKey: 'onb.injKnee' },
  { id: 'back', labelKey: 'onb.injBack' },
  { id: 'shoulder', labelKey: 'onb.injShoulder' },
  { id: 'wrist', labelKey: 'onb.injWrist' },
  { id: 'ankle', labelKey: 'onb.injAnkle' },
]

// Подписи дней берутся из 'calendar.weekdays' по индексу.
export const DAY_OPTIONS = [
  { id: 'mon' }, { id: 'tue' }, { id: 'wed' }, { id: 'thu' },
  { id: 'fri' }, { id: 'sat' }, { id: 'sun' },
]

const DAY_ORDER = DAY_OPTIONS.map((d) => d.id)

// Стартовая расстановка дней — как в рекомендации бэкенда (recommendation.py).
export const DAYS_BY_LEVEL = {
  beginner: ['mon', 'thu'],
  intermediate: ['mon', 'wed', 'fri'],
  advanced: ['mon', 'tue', 'thu', 'sat'],
}

export const sortDays = (days) => [...days].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b))

export const STEPS = ['name', 'birth', 'body', 'goal', 'level', 'injuries', 'days']
export const ACCOUNT_STEP = 'account'

// «Своя программа» — опрос заканчивается на пятом шаге: травмы и дни
// не нужны, человек сам соберёт расписание в приложении.
export const isCustomProgram = (form) => form.level === 'custom'

export const stepsForForm = (form, askAccount = false) => {
  const base = isCustomProgram(form) ? STEPS.slice(0, STEPS.indexOf('level') + 1) : STEPS
  return askAccount ? [...base, ACCOUNT_STEP] : base
}

export function calcAge(birthDate) {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1
  return age
}

export function validateStep(step, form, t) {
  const errors = {}

  if (step === 'name') {
    if (!form.name.trim()) errors.name = t('onb.errName')
    else if (form.name.trim().length < 2) errors.name = t('onb.errNameShort')
  }

  if (step === 'birth') {
    const age = calcAge(form.birthDate)
    if (!form.birthDate) errors.birthDate = t('onb.errBirth')
    else if (age === null) errors.birthDate = t('onb.errBirthInvalid')
    else if (age < 14) errors.birthDate = t('onb.errAge14')
    else if (age > 100) errors.birthDate = t('onb.errAge100')
  }

  if (step === 'body') {
    const height = Number(String(form.height).replace(',', '.'))
    const weight = Number(String(form.weight).replace(',', '.'))
    if (!form.height) errors.height = t('onb.errHeight')
    else if (!Number.isFinite(height) || height < 80 || height > 250) errors.height = t('onb.errHeightRange')
    if (!form.weight) errors.weight = t('onb.errWeight')
    else if (!Number.isFinite(weight) || weight < 20 || weight > 300) errors.weight = t('onb.errWeightRange')
    if (!form.gender) errors.gender = t('onb.errGender')
  }

  if (step === 'goal' && !form.goal) errors.goal = t('onb.errGoal')
  if (step === 'level') {
    if (!form.level) errors.level = t('onb.errLevel')
    // При «своей программе» место тренировок не спрашиваем.
    if (!isCustomProgram(form) && !form.place) errors.place = t('onb.errPlace')
  }

  if (step === 'days' && form.trainingDays.length === 0) {
    errors.days = t('onb.errDays')
  }

  if (step === ACCOUNT_STEP) {
    const email = form.email.trim()
    if (!email) errors.email = t('onb.errEmail')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = t('onb.errEmailInvalid')
    if (!form.password) errors.password = t('onb.errPassword')
    else if (form.password.length < 8) errors.password = t('onb.errPassword8')
  }

  return errors
}

export function buildPayload(form) {
  const custom = isCustomProgram(form)
  const injuries = custom || form.injuries.includes('none')
    ? []
    : form.injuries

  const account = form.email?.trim()
    ? { email: form.email.trim().toLowerCase(), password: form.password }
    : {}

  return {
    ...account,
    name: form.name.trim(),
    birth_date: form.birthDate,
    gender: form.gender,
    height: Math.round(Number(String(form.height).replace(',', '.'))),
    weight: Number(Number(String(form.weight).replace(',', '.')).toFixed(1)),
    goal: form.goal,
    level: form.level,
    place: custom ? '' : form.place,
    injuries,
    training_days: custom ? [] : sortDays(form.trainingDays),
  }
}
