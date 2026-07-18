export const GENDER_OPTIONS = [
  { id: 'male', label: 'Мужской' },
  { id: 'female', label: 'Женский' },
  { id: 'other', label: 'Другое' },
]

export const GOAL_OPTIONS = [
  { id: 'cut', label: 'Похудеть', hint: 'Снизить процент жира, стать суше' },
  { id: 'bulk', label: 'Набрать массу', hint: 'Прибавить мышцы и силу' },
  { id: 'maintain', label: 'Поддержать форму', hint: 'Оставаться в тонусе' },
  { id: 'endurance', label: 'Выносливость', hint: 'Больше энергии и дыхалки' },
  { id: 'recomp', label: 'Рекомпозиция', hint: 'Меньше жира, больше мышц' },
]

export const LEVEL_OPTIONS = [
  { id: 'beginner', label: 'Новичок', hint: 'Мало опыта или большой перерыв' },
  { id: 'intermediate', label: 'Средний', hint: 'Тренируюсь регулярно' },
  { id: 'advanced', label: 'Продвинутый', hint: 'Стаж больше двух лет' },
]

export const PLACE_OPTIONS = [
  { id: 'gym', label: 'В зале', hint: 'Есть доступ к оборудованию' },
  { id: 'home', label: 'Дома', hint: 'Минимум инвентаря' },
]

export const INJURY_OPTIONS = [
  { id: 'none', label: 'Нет травм' },
  { id: 'knee', label: 'Колени' },
  { id: 'back', label: 'Спина · поясница' },
  { id: 'shoulder', label: 'Плечи' },
  { id: 'wrist', label: 'Запястья' },
  { id: 'ankle', label: 'Голеностоп' },
]

export const STEPS = ['name', 'birth', 'body', 'goal', 'level', 'injuries']

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

export function validateStep(step, form) {
  const errors = {}

  if (step === 'name') {
    if (!form.name.trim()) errors.name = 'Укажите имя'
    else if (form.name.trim().length < 2) errors.name = 'Слишком короткое имя'
  }

  if (step === 'birth') {
    const age = calcAge(form.birthDate)
    if (!form.birthDate) errors.birthDate = 'Укажите дату рождения'
    else if (age === null) errors.birthDate = 'Некорректная дата'
    else if (age < 14) errors.birthDate = 'Приложение доступно с 14 лет'
    else if (age > 100) errors.birthDate = 'Проверьте дату рождения'
  }

  if (step === 'body') {
    const height = Number(String(form.height).replace(',', '.'))
    const weight = Number(String(form.weight).replace(',', '.'))
    if (!form.height) errors.height = 'Укажите рост'
    else if (!Number.isFinite(height) || height < 80 || height > 250) errors.height = 'Рост от 80 до 250 см'
    if (!form.weight) errors.weight = 'Укажите вес'
    else if (!Number.isFinite(weight) || weight < 20 || weight > 300) errors.weight = 'Вес от 20 до 300 кг'
    if (!form.gender) errors.gender = 'Выберите пол'
  }

  if (step === 'goal' && !form.goal) errors.goal = 'Выберите цель'
  if (step === 'level') {
    if (!form.level) errors.level = 'Выберите уровень'
    if (!form.place) errors.place = 'Выберите, где будете тренироваться'
  }

  return errors
}

export function buildPayload(form) {
  const injuries = form.injuries.includes('none')
    ? []
    : form.injuries

  return {
    name: form.name.trim(),
    birth_date: form.birthDate,
    gender: form.gender,
    height: Math.round(Number(String(form.height).replace(',', '.'))),
    weight: Number(Number(String(form.weight).replace(',', '.')).toFixed(1)),
    goal: form.goal,
    level: form.level,
    place: form.place,
    injuries,
  }
}
