const DEMO_VIDEO = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'

export const EXERCISE_TEMPLATES = {
  squat: {
    name: 'Приседания со штангой',
    description: 'Держите спину ровно, колени направлены по линии носков. Опускайтесь до параллели бедра с полом.',
    muscle: 'Ноги · Ягодицы',
  },
  deadlift: {
    name: 'Становая тяга',
    description: 'Корпус стабилен, штанга движется близко к телу. В верхней точке — полное разгибание.',
    muscle: 'Спина · Задняя поверхность',
  },
  bench: {
    name: 'Жим лёжа',
    description: 'Лопатки сведены, локти под углом 45°. Контролируйте опускание и мощный подъём.',
    muscle: 'Грудь · Трицепс',
  },
  row: {
    name: 'Тяга в наклоне',
    description: 'Корпус параллелен полу, тяните локтями назад. Сводите лопатки в верхней точке.',
    muscle: 'Спина · Бицепс',
  },
  pullup: {
    name: 'Подтягивания',
    description: 'Полная амплитуда: подбородок над перекладиной, контролируемое опускание.',
    muscle: 'Спина · Бицепс',
  },
  plank: {
    name: 'Планка',
    description: 'Тело — прямая линия от головы до пят. Напрягите пресс и ягодицы.',
    muscle: 'Кор · Стабилизация',
  },
  burpee: {
    name: 'Бёрпи',
    description: 'Прыжок, отжимание, прыжок. Держите темп и дыхание ровным.',
    muscle: 'Full body · Кардио',
  },
  lunge: {
    name: 'Выпады с гантелями',
    description: 'Шаг вперёд, колено задней ноги почти касается пола. Корпус вертикально.',
    muscle: 'Ноги · Ягодицы',
  },
  pushup: {
    name: 'Отжимания',
    description: 'Корпус жёсткий, локти под углом 45°. Грудь почти касается пола.',
    muscle: 'Грудь · Трицепс',
  },
  jump: {
    name: 'Прыжки на скакалке',
    description: 'Лёгкие приземления на носки. Руки у корпуса, темп стабильный.',
    muscle: 'Кардио · Выносливость',
  },
}

function buildExercise(key, sets, reps, weight, restSec) {
  const t = EXERCISE_TEMPLATES[key]
  return {
    id: key,
    name: t.name,
    description: t.description,
    muscle: t.muscle,
    sets,
    reps,
    weight,
    rest: `${restSec} сек`,
    videoUrl: DEMO_VIDEO,
  }
}

export const WORKOUTS = {
  'gym-fat-burn-power': {
    id: 'gym-fat-burn-power',
    title: 'Fat Burn Power',
    description: 'Силовой микс для жиросжигания, рельефа и выносливости. Интервальные блоки с базовыми движениями.',
    duration: '35 мин',
    calories: '350 ккал',
    intensity: 'Высокая',
    tone: 'tone-rose',
    exercises: [
      buildExercise('burpee', 4, 12, 'Собственный вес', 60),
      buildExercise('squat', 4, 15, '50 кг', 75),
      buildExercise('bench', 3, 12, '40 кг', 90),
      buildExercise('row', 3, 12, '35 кг', 75),
      buildExercise('plank', 3, 45, '—', 45),
    ],
  },
  'gym-fullbody': {
    id: 'gym-fullbody',
    title: 'Full Body Burn',
    description: 'Высокоинтенсивная тренировка на все тело. Идеальна для жиросжигания и тонуса.',
    duration: '25 мин',
    calories: '280 ккал',
    intensity: 'Средняя',
    tone: 'tone-blue-card',
    exercises: [
      buildExercise('squat', 4, 12, '60 кг', 90),
      buildExercise('bench', 3, 10, '50 кг', 90),
      buildExercise('row', 3, 12, '40 кг', 75),
      buildExercise('lunge', 3, 10, '16 кг', 60),
      buildExercise('plank', 3, 40, '—', 45),
    ],
  },
  'gym-power': {
    id: 'gym-power',
    title: 'Power Lift Routine',
    description: 'Фокус на базовых движениях и силе. Тяжёлые подходы с полным восстановлением.',
    duration: '40 мин',
    calories: '320 ккал',
    intensity: 'Высокая',
    tone: 'tone-green-card',
    exercises: [
      buildExercise('squat', 5, 5, '80 кг', 180),
      buildExercise('deadlift', 4, 5, '100 кг', 180),
      buildExercise('bench', 4, 6, '70 кг', 150),
      buildExercise('row', 3, 8, '50 кг', 120),
    ],
  },
  'gym-hiit': {
    id: 'gym-hiit',
    title: 'HIIT Condition',
    description: 'Интервальные блоки для выносливости. Короткий отдых, высокий пульс.',
    duration: '30 мин',
    calories: '380 ккал',
    intensity: 'Интенсивно',
    tone: 'tone-charcoal-card',
    exercises: [
      buildExercise('burpee', 5, 15, '—', 45),
      buildExercise('jump', 4, 60, '—', 30),
      buildExercise('pushup', 4, 15, '—', 45),
      buildExercise('lunge', 3, 12, '—', 45),
      buildExercise('plank', 3, 50, '—', 30),
    ],
  },
  'home-energy-flow': {
    id: 'home-energy-flow',
    title: 'Home Energy Flow',
    description: 'Комплекс без оборудования для рельефа и тонуса. Подходит для утренней активации.',
    duration: '28 мин',
    calories: '260 ккал',
    intensity: 'Средняя',
    tone: 'tone-sand',
    exercises: [
      buildExercise('pushup', 4, 12, '—', 60),
      buildExercise('squat', 4, 20, '—', 45),
      buildExercise('plank', 3, 45, '—', 40),
      buildExercise('lunge', 3, 12, '—', 45),
      buildExercise('burpee', 3, 10, '—', 60),
    ],
  },
  'home-morning': {
    id: 'home-morning',
    title: 'Morning Wake Up',
    description: 'Лёгкий старт дня для активации мышц и пробуждения тела.',
    duration: '18 мин',
    calories: '150 ккал',
    intensity: 'Лёгкая',
    tone: 'tone-blue-card',
    exercises: [
      buildExercise('plank', 3, 30, '—', 30),
      buildExercise('squat', 3, 15, '—', 40),
      buildExercise('pushup', 3, 10, '—', 45),
      buildExercise('lunge', 2, 10, '—', 40),
    ],
  },
  'home-core': {
    id: 'home-core',
    title: 'Core & Balance',
    description: 'Пресс, стабилизация и осанка. Укрепление центра тела.',
    duration: '24 мин',
    calories: '180 ккал',
    intensity: 'Средняя',
    tone: 'tone-green-card',
    exercises: [
      buildExercise('plank', 4, 45, '—', 40),
      buildExercise('lunge', 3, 12, '—', 45),
      buildExercise('pushup', 3, 12, '—', 50),
      buildExercise('squat', 3, 15, '—', 45),
    ],
  },
  'home-cardio': {
    id: 'home-cardio',
    title: 'Cardio Blast',
    description: 'Пульсовая тренировка в домашних условиях. Без оборудования.',
    duration: '22 мин',
    calories: '240 ккал',
    intensity: 'Высокая',
    tone: 'tone-charcoal-card',
    exercises: [
      buildExercise('burpee', 4, 12, '—', 40),
      buildExercise('jump', 4, 45, '—', 30),
      buildExercise('squat', 3, 20, '—', 35),
      buildExercise('pushup', 3, 15, '—', 40),
    ],
  },
}

export const DEFAULT_WORKOUT_ID = 'gym-fullbody'

export function getWorkoutById(id) {
  return WORKOUTS[id] ?? WORKOUTS[DEFAULT_WORKOUT_ID]
}

export function getFeaturedWorkoutId(mode) {
  return mode === 'home' ? 'home-energy-flow' : 'gym-fat-burn-power'
}
