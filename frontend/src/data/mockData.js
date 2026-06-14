export const NAV_ITEMS = [
  { key: 'home', label: 'Главная' },
  { key: 'trainings', label: 'Тренировки' },
  { key: 'analytics', label: 'Аналитика' },
  { key: 'profile', label: 'Личный кабинет' },
]

export const MOCK_USER = {
  name: 'Михаил',
  email: 'mikhail@train.app',
  gender: 'Мужской',
  weight: 85.4,
  height: 182,
  goal: 'Сушка',
  subscription: {
    plan: 'Premium',
    nextCharge: '31.05.2026',
    status: 'Активна',
  },
}

export const HOME_STATS = [
  { label: 'Вес', value: '85.4 кг' },
  { label: 'Тренировок', value: '48' },
  { label: 'Активность', value: '22 дня' },
]

export const HOME_WEEKLY_GOAL = {
  title: 'Цель на неделю',
  completed: 1,
  target: 3,
  days: [
    { id: 'mon', label: 'Пн', date: 16, state: 'done' },
    { id: 'tue', label: 'Вт', date: 17, state: 'default' },
    { id: 'wed', label: 'Ср', date: 18, state: 'active' },
    { id: 'thu', label: 'Чт', date: 19, state: 'default' },
    { id: 'fri', label: 'Пт', date: 20, state: 'default' },
    { id: 'sat', label: 'Сб', date: 21, state: 'default' },
    { id: 'sun', label: 'Вс', date: 22, state: 'default' },
  ],
}

export const TODAY_PLAN = [
  { title: 'Силовая', subtitle: 'День 3 · Спина + бицепс' },
  { title: 'Кардио', subtitle: '20 минут · зона 2' },
  { title: 'Питание', subtitle: '2200 ккал · белок 170г' },
]

export const TRAINING_CATALOG = {
  gym: {
    key: 'gym',
    title: 'Тренировка в зале',
    featured: {
      title: 'Fat Burn Power',
      subtitle: 'Силовой микс для жиросжигания, рельефа и выносливости',
      duration: '35 мин',
      calories: '350 ккал',
      tone: 'tone-rose',
    },
    categories: [
      { id: 'running', label: 'Бег', tone: 'tone-sky' },
      { id: 'fitness', label: 'Фитнес', tone: 'tone-rose-soft' },
      { id: 'workout', label: 'Силовая', tone: 'tone-violet' },
      { id: 'boxing', label: 'Бокс', tone: 'tone-mint' },
    ],
    programs: [
      {
        id: 'gym-fullbody',
        title: 'Full Body Burn',
        description: 'Высокоинтенсивная тренировка на все тело',
        duration: '25 мин',
        intensity: 'Интенсивно',
        tag: 'Зал · Средний',
        tone: 'tone-blue-card',
      },
      {
        id: 'gym-power',
        title: 'Power Lift Routine',
        description: 'Фокус на базовых движениях и силе',
        duration: '40 мин',
        intensity: 'Сила',
        tag: 'Зал · Продвинутый',
        tone: 'tone-green-card',
      },
      {
        id: 'gym-hiit',
        title: 'HIIT Condition',
        description: 'Интервальные блоки для выносливости',
        duration: '30 мин',
        intensity: 'Кардио',
        tag: 'Зал · Быстрый темп',
        tone: 'tone-charcoal-card',
      },
    ],
  },
  home: {
    key: 'home',
    title: 'Дома',
    featured: {
      title: 'Home Energy Flow',
      subtitle: 'Комплекс без оборудования для рельефа и тонуса',
      duration: '28 мин',
      calories: '260 ккал',
      tone: 'tone-sand',
    },
    categories: [
      { id: 'mobility', label: 'Мобилити', tone: 'tone-sky' },
      { id: 'core', label: 'Core', tone: 'tone-rose-soft' },
      { id: 'hiit', label: 'HIIT', tone: 'tone-violet' },
      { id: 'stretch', label: 'Растяжка', tone: 'tone-mint' },
    ],
    programs: [
      {
        id: 'home-morning',
        title: 'Morning Wake Up',
        description: 'Легкий старт дня для активации мышц',
        duration: '18 мин',
        intensity: 'Легко',
        tag: 'Дома · Утро',
        tone: 'tone-blue-card',
      },
      {
        id: 'home-core',
        title: 'Core & Balance',
        description: 'Пресс, стабилизация и осанка',
        duration: '24 мин',
        intensity: 'Тонус',
        tag: 'Дома · Средний',
        tone: 'tone-green-card',
      },
      {
        id: 'home-cardio',
        title: 'Cardio Blast',
        description: 'Пульсовая тренировка в домашних условиях',
        duration: '22 мин',
        intensity: 'Пульс',
        tag: 'Дома · Энергия',
        tone: 'tone-charcoal-card',
      },
    ],
  },
}

export const TRAINING_PROGRAMS = [
  {
    id: 'cutting',
    name: 'Сушка 8 недель',
    description: 'Программа для снижения процента жира и сохранения мышц.',
    weeks: ['Неделя 1', 'Неделя 2', 'Неделя 3', 'Неделя 4', 'Неделя 5', 'Неделя 6', 'Неделя 7', 'Неделя 8'],
    focus: 'Снижение веса',
  },
  {
    id: 'mass',
    name: 'Набор массы',
    description: 'Постепенное увеличение объема нагрузок с акцентом на базу.',
    weeks: ['Неделя 1', 'Неделя 2', 'Неделя 3', 'Неделя 4', 'Неделя 5', 'Неделя 6'],
    focus: 'Мышечный рост',
  },
  {
    id: 'home',
    name: 'Домашние тренировки',
    description: 'Короткие сессии без оборудования для стабильной формы.',
    weeks: ['Неделя 1', 'Неделя 2', 'Неделя 3', 'Неделя 4'],
    focus: 'Выносливость',
  },
  {
    id: 'fullbody',
    name: 'Full Body',
    description: 'Три тренировки в неделю с проработкой всего тела.',
    weeks: ['Неделя 1', 'Неделя 2', 'Неделя 3', 'Неделя 4', 'Неделя 5'],
    focus: 'Силовой баланс',
  },
]

export const NUTRITION_OVERVIEW = {
  calories: 2200,
  eaten: 1680,
  protein: { current: 132, target: 170 },
  fats: { current: 58, target: 70 },
  carbs: { current: 176, target: 230 },
  water: { current: 1.7, target: 2.5 },
}

export const DAILY_MEALS = [
  { id: 'breakfast', title: 'Завтрак', time: '08:30', kcal: 480, status: 'Съедено' },
  { id: 'lunch', title: 'Обед', time: '13:10', kcal: 620, status: 'Съедено' },
  { id: 'snack', title: 'Перекус', time: '16:40', kcal: 210, status: 'План' },
  { id: 'dinner', title: 'Ужин', time: '20:00', kcal: 540, status: 'План' },
]

export const RECIPES = [
  { id: 'r1', title: 'Омлет с индейкой', calories: '410 ккал', macros: 'Б 36 · Ж 18 · У 22' },
  { id: 'r2', title: 'Поке с тунцом', calories: '530 ккал', macros: 'Б 42 · Ж 14 · У 56' },
  { id: 'r3', title: 'Греческий йогурт + ягоды', calories: '260 ккал', macros: 'Б 25 · Ж 6 · У 27' },
]

export const KNOWLEDGE_CATEGORIES = ['Тренировки', 'Питание', 'Восстановление', 'Мотивация']

export const KNOWLEDGE_ARTICLES = [
  {
    id: 'a1',
    category: 'Питание',
    title: 'Как считать БЖУ без стресса',
    readTime: '7 мин',
    level: 'База',
  },
  {
    id: 'a2',
    category: 'Тренировки',
    title: 'Прогрессия нагрузок: когда и как повышать вес',
    readTime: '9 мин',
    level: 'Средний',
  },
  {
    id: 'a3',
    category: 'Восстановление',
    title: 'Сон и результаты: сколько нужно спать',
    readTime: '6 мин',
    level: 'База',
  },
  {
    id: 'a4',
    category: 'Мотивация',
    title: 'Как не сорваться на 3-й неделе программы',
    readTime: '5 мин',
    level: 'База',
  },
  {
    id: 'a5',
    category: 'Питание',
    title: 'Рефид и читмил: в чем разница',
    readTime: '8 мин',
    level: 'Средний',
  },
]

export const WEIGHT_HISTORY = [
  { date: '01.05', value: 90.5 },
  { date: '05.05', value: 90.1 },
  { date: '09.05', value: 88.9 },
  { date: '13.05', value: 88.3 },
  { date: '17.05', value: 87.9 },
  { date: '21.05', value: 87.1 },
  { date: '25.05', value: 87.0 },
  { date: '29.05', value: 86.2 },
  { date: '02.06', value: 85.8 },
]

export const MEASUREMENTS = [
  { label: 'Текущий вес', value: '85.4 кг' },
  { label: 'Процент жира', value: '12.7%' },
  { label: 'Мышечная масса', value: '68.3 кг' },
  { label: 'Талия', value: '84 см' },
  { label: 'Грудь', value: '104 см' },
  { label: 'Бедро', value: '60 см' },
]

export const ACTIVITY_BY_DAY = [
  { day: 'Пн', value: 2 },
  { day: 'Вт', value: 3 },
  { day: 'Ср', value: 1 },
  { day: 'Чт', value: 4 },
  { day: 'Пт', value: 2 },
  { day: 'Сб', value: 3 },
  { day: 'Вс', value: 1 },
]

export const PROGRESS_PHOTOS = ['01.05', '15.05', '29.05']

export const PROFILE_ACTIONS = [
  { id: 'personal', title: 'Личные данные', value: 'Редактировать' },
  { id: 'subscription', title: 'Подписка', value: 'Premium' },
  { id: 'notifications', title: 'Уведомления', value: 'Включены' },
  { id: 'settings', title: 'Настройки', value: 'Открыть' },
]

export const INITIAL_CALCULATOR_FORM = {
  weight: '85.4',
  height: '182',
  age: '30',
  activity: '1.55',
  goal: 'cut',
  gender: 'male',
}
