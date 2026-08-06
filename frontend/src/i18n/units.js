// Конвертация единиц измерения. В базе и API всё хранится в метрической
// системе (кг, см, л) — имперские значения существуют только на экране
// и во вводе: показ конвертирует из метрики, сохранение — обратно.

const KG_PER_LB = 0.45359237
const CM_PER_IN = 2.54
const OZ_PER_L = 33.814

const round1 = (value) => Math.round(value * 10) / 10

/**
 * Хелперы под выбранную систему: makeUnitHelpers('imperial', t).
 * Лейблы единиц берутся из переводов, чтобы «кг» → "kg" на английском.
 */
export function makeUnitHelpers(system, t) {
  const imperial = system === 'imperial'

  const weight = (kg) => {
    const num = Number(kg)
    if (!Number.isFinite(num)) return num
    return imperial ? round1(num / KG_PER_LB) : round1(num)
  }
  const length = (cm) => {
    const num = Number(cm)
    if (!Number.isFinite(num)) return num
    return imperial ? round1(num / CM_PER_IN) : round1(num)
  }
  const water = (liters) => {
    const num = Number(liters)
    if (!Number.isFinite(num)) return num
    return imperial ? Math.round(num * OZ_PER_L) : num
  }

  const weightLabel = imperial ? t('units.lb') : t('stats.kg')
  const lengthLabel = imperial ? t('units.in') : t('stats.cm')
  const waterLabel = imperial ? t('units.oz') : t('nutrition.liters')

  return {
    system,
    imperial,
    weightLabel,
    lengthLabel,
    waterLabel,

    weight,
    length,
    water,
    weightToKg: (value) => (imperial ? value * KG_PER_LB : value),
    lengthToCm: (value) => (imperial ? value * CM_PER_IN : value),

    fmtWeight: (kg) => (Number.isFinite(Number(kg)) && kg !== null && kg !== '' ? `${weight(kg)} ${weightLabel}` : '—'),
    fmtLength: (cm) => (Number.isFinite(Number(cm)) && cm !== null && cm !== '' ? `${length(cm)} ${lengthLabel}` : '—'),
    // Рост в имперской системе привычнее в футах и дюймах: 182 см → 5'12" → 6'0".
    fmtHeight: (cm) => {
      const num = Number(cm)
      if (!Number.isFinite(num) || !num) return '—'
      if (!imperial) return `${Math.round(num)} ${t('stats.cm')}`
      const totalInches = Math.round(num / CM_PER_IN)
      return `${Math.floor(totalInches / 12)}'${totalInches % 12}"`
    },
    fmtWater: (liters, target) => `${water(liters)}/${water(target)} ${waterLabel}`,
  }
}
