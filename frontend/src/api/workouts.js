import client from './client'

export const getWorkoutCatalog = (mode) =>
  client.get('/workouts/', mode ? { params: { mode } } : {})

export const getWorkout = (id) => client.get(`/workouts/${id}/`)

export const getExercises = () => client.get('/exercises/')

export const createSession = (workoutId, startedAt) =>
  client.post('/sessions/', { workout_id: workoutId, started_at: startedAt })

export const updateSession = (sessionId, data) =>
  client.patch(`/sessions/${sessionId}/`, data)

export const completeSession = (sessionId, data) =>
  client.post(`/sessions/${sessionId}/complete/`, data)

export const abandonSession = (sessionId) =>
  client.delete(`/sessions/${sessionId}/`)
