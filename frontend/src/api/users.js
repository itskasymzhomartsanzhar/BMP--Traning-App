import client from './client'

export const getMe = () => client.get('/users/me/')
export const updateMe = (data) => client.patch('/users/me/', data)
export const getDashboard = () => client.get('/users/me/dashboard/')
export const getTrainingSchedule = () => client.get('/users/me/training-schedule/')
export const updateTrainingSchedule = (days) => client.put('/users/me/training-schedule/', { days })
export const getOnboardingStatus = () => client.get('/users/me/onboarding/')
export const submitOnboarding = (data) => client.post('/users/me/onboarding/', data)
