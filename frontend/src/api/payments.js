import client from './client'

export const getSubscriptionPlans = () => client.get('/subscriptions/plans/')
export const getMySubscription = () => client.get('/subscriptions/me/')
export const createPayment = (planId, returnUrl) =>
  client.post('/subscriptions/', { plan_id: planId, return_url: returnUrl })
export const cancelSubscription = () => client.delete('/subscriptions/me/')
