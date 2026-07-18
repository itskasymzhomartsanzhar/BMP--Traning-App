"""Подбор рекомендованной программы по данным онбординга."""

from workouts.models import WorkoutProgram

# Упражнения/программы, противопоказанные при конкретных травмах.
INJURY_BLOCKLIST = {
    'knee': {'gym-hiit', 'gym-fat-burn-power', 'home-cardio'},
    'back': {'gym-power', 'gym-hiit', 'gym-fat-burn-power'},
    'shoulder': {'gym-power'},
    'wrist': {'gym-power'},
    'ankle': {'gym-hiit', 'home-cardio', 'gym-fat-burn-power'},
}

# Приоритет программ по цели, от наиболее подходящей к запасной.
GOAL_PRIORITY = {
    'cut': ['gym-fat-burn-power', 'gym-hiit', 'home-cardio', 'gym-fullbody', 'home-energy-flow'],
    'bulk': ['gym-power', 'gym-fullbody', 'home-core', 'home-energy-flow'],
    'maintain': ['gym-fullbody', 'home-energy-flow', 'home-core', 'home-morning'],
    'endurance': ['gym-hiit', 'home-cardio', 'gym-fat-burn-power', 'home-energy-flow'],
    'recomp': ['gym-fullbody', 'gym-power', 'home-energy-flow', 'home-core'],
}

# Для новичка и старшего возраста тяжёлые программы заменяем мягкими.
GENTLE_FALLBACK = ['home-morning', 'home-core', 'home-energy-flow', 'gym-fullbody']

HARD_PROGRAMS = {'gym-hiit', 'gym-power', 'gym-fat-burn-power'}

TRAINING_DAYS_BY_LEVEL = {
    'beginner': ['mon', 'thu'],
    'intermediate': ['mon', 'wed', 'fri'],
    'advanced': ['mon', 'tue', 'thu', 'sat'],
}


def _blocked_programs(injuries):
    blocked = set()
    for injury in injuries or []:
        blocked |= INJURY_BLOCKLIST.get(injury, set())
    return blocked


def recommend_program(*, goal, level, place, injuries=None, age=None):
    """Возвращает (program_id, reason) — id может быть None, если каталог пуст."""
    available = set(
        WorkoutProgram.objects.filter(is_active=True).values_list('id', flat=True)
    )
    if not available:
        return None, ''

    blocked = _blocked_programs(injuries)
    candidates = GOAL_PRIORITY.get(goal) or GOAL_PRIORITY['maintain']

    # Новичкам и людям 50+ не даём высокоинтенсивные программы.
    gentle = level == 'beginner' or (age is not None and age >= 50)
    if gentle:
        candidates = [c for c in candidates if c not in HARD_PROGRAMS] + GENTLE_FALLBACK

    # Учитываем предпочтение места, но не ценой полного отсутствия варианта.
    def matches_place(program_id):
        if not place:
            return True
        return program_id.startswith(f'{place}-')

    ordered = (
        [c for c in candidates if matches_place(c)]
        + [c for c in candidates if not matches_place(c)]
        + GENTLE_FALLBACK
    )

    for program_id in ordered:
        if program_id in available and program_id not in blocked:
            return program_id, _build_reason(goal, level, place, injuries, gentle)

    # Всё заблокировано травмами — берём любую доступную мягкую программу.
    for program_id in sorted(available):
        if program_id not in blocked:
            return program_id, _build_reason(goal, level, place, injuries, gentle)

    return sorted(available)[0], _build_reason(goal, level, place, injuries, gentle)


def _build_reason(goal, level, place, injuries, gentle):
    goal_text = {
        'cut': 'снижения веса',
        'bulk': 'набора массы',
        'maintain': 'поддержания формы',
        'endurance': 'роста выносливости',
        'recomp': 'рекомпозиции',
    }.get(goal, 'ваших целей')

    parts = [f'Подобрано для {goal_text}']
    if place == 'home':
        parts.append('без оборудования, дома')
    elif place == 'gym':
        parts.append('с работой в зале')
    if gentle:
        parts.append('со щадящей нагрузкой на старте')
    real_injuries = [i for i in (injuries or []) if i != 'none']
    if real_injuries:
        parts.append('с учётом ограничений по травмам')
    return ', '.join(parts) + '.'


def recommend_training_days(level):
    return TRAINING_DAYS_BY_LEVEL.get(level, TRAINING_DAYS_BY_LEVEL['intermediate'])
