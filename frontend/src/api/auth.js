import client from './client'

export function telegramLogin(initData) {
  return client.post('/auth/telegram/', { init_data: initData })
}

export const telegramWidgetLogin = (widgetUser) => client.post('/auth/telegram-widget/', widgetUser)
export const emailRegister = (data) => client.post('/auth/register/', data)
export const emailLogin = (email, password) => client.post('/auth/login/', { email, password })
export const planPreview = (data) => client.post('/auth/plan-preview/', data)
export const linkTelegram = (widgetUser) => client.post('/users/me/link-telegram/', widgetUser)
