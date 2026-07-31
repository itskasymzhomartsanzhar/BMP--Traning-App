import client from './client'

export const getNutritionDay = (date) =>
  client.get('/nutrition/daily/', date ? { params: { date } } : {})

export const updateNutritionDay = (date, data) =>
  client.patch('/nutrition/daily/', data, { params: { date } })

export const addWater = (amountLiters, date) =>
  client.post('/nutrition/water/', { amount_liters: amountLiters, date })
