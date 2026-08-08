// Утилиты добавления еды: без компонентов, чтобы не задевать react-refresh.

// Сжимаем фото перед отправкой в ИИ: хватает 1280px по длинной стороне.
export async function compressImage(file, maxSide = 1280, quality = 0.82) {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    if (scale === 1 && file.type === 'image/jpeg' && file.size < 1.5 * 1024 * 1024) {
      bitmap.close?.()
      return file
    }
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close?.()
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!blob) return file
    return new File([blob], 'food.jpg', { type: 'image/jpeg' })
  } catch {
    // Любой сбой сжатия не должен ломать сценарий — шлём оригинал.
    return file
  }
}

const round1 = (value) => Math.round(value * 10) / 10

// КБЖУ порции из значений «на 100 г».
export function portionFromPer100(per100, grams) {
  const ratio = grams / 100
  return {
    grams: round1(grams),
    calories: round1((per100.calories || 0) * ratio),
    protein: round1((per100.protein || 0) * ratio),
    fats: round1((per100.fats || 0) * ratio),
    carbs: round1((per100.carbs || 0) * ratio),
  }
}

// Пересчёт позиции при изменении граммов: пропорционально исходной оценке.
export function scaleItem(base, grams) {
  const ratio = base.grams > 0 ? grams / base.grams : 1
  return {
    ...base,
    grams: round1(grams),
    calories: round1(base.calories * ratio),
    protein: round1(base.protein * ratio),
    fats: round1(base.fats * ratio),
    carbs: round1(base.carbs * ratio),
  }
}

export function sumItems(items) {
  return items.reduce(
    (acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.protein || 0),
      fats: acc.fats + (item.fats || 0),
      carbs: acc.carbs + (item.carbs || 0),
    }),
    { calories: 0, protein: 0, fats: 0, carbs: 0 },
  )
}

export const apiErrorText = (error, fallback) =>
  error?.response?.data?.detail || fallback
