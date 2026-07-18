import client from './client'

export const getNutritionDay = (date) =>
  client.get('/nutrition/daily/', date ? { params: { date } } : {})

export const updateNutritionDay = (date, data) =>
  client.patch('/nutrition/daily/', data, { params: { date } })

export const addWater = (amountLiters, date) =>
  client.post('/nutrition/water/', { amount_liters: amountLiters, date })

export const getMeals = (date) =>
  client.get('/nutrition/meals/', date ? { params: { date } } : {})

export const createMeal = (data) => client.post('/nutrition/meals/', data)

export const updateMeal = (mealId, data) =>
  client.patch(`/nutrition/meals/${mealId}/`, data)

export const deleteMeal = (mealId) =>
  client.delete(`/nutrition/meals/${mealId}/`)

export const getRecipes = () => client.get('/recipes/')

export const getRecipe = (id) => client.get(`/recipes/${id}/`)
