import client from './client'

export const getNutritionDay = (date) =>
  client.get('/nutrition/daily/', date ? { params: { date } } : {})

export const updateNutritionDay = (date, data) =>
  client.patch('/nutrition/daily/', data, { params: { date } })

export const addWater = (amountLiters, date) =>
  client.post('/nutrition/water/', { amount_liters: amountLiters, date })

export const addFoodEntries = (date, entries, source) =>
  client.post('/nutrition/entries/', { date, entries, source })

export const deleteFoodEntry = (entryId) =>
  client.delete(`/nutrition/entries/${entryId}/`)

// Распознавание может занимать десятки секунд — таймауты шире обычного.
export const analyzeFoodPhoto = (file) => {
  const form = new FormData()
  form.append('image', file, file.name || 'food.jpg')
  return client.post('/nutrition/ai/photo/', form, { timeout: 90000 })
}

export const analyzeFoodVoice = ({ audio, text }) => {
  const form = new FormData()
  if (audio) form.append('audio', audio, audio.name || 'voice.webm')
  if (text) form.append('text', text)
  return client.post('/nutrition/ai/voice/', form, { timeout: 90000 })
}

export const lookupBarcode = (code) =>
  client.get(`/nutrition/barcode/${code}/`)

export const searchFood = (query) =>
  client.get('/nutrition/search/', { params: { q: query } })
