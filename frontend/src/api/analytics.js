import client from './client'

export const getActivity = () => client.get('/analytics/activity/')
export const getStreak = () => client.get('/analytics/streak/')
export const getWeightHistory = () => client.get('/analytics/weight/')
export const addWeight = (value, date) =>
  client.post('/analytics/weight/', { value, recorded_at: date })
export const getMeasurements = () => client.get('/analytics/measurements/')
export const addMeasurement = (data) => client.post('/analytics/measurements/', data)
export const getProgressPhotos = () => client.get('/analytics/photos/')
export const uploadProgressPhoto = (file) => {
  const formData = new FormData()
  formData.append('file', file, file.name || 'progress.jpg')
  // axios заменит заголовок на multipart с boundary из-за FormData
  return client.post('/analytics/photos/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
