// Версия v2: старая сборка автоматически логинила каждый браузер dev-пользователем
// и складывала токены под ключами без версии. Смена ключей сбрасывает те сессии
// в гостя — иначе люди попадали в приложение мимо экрана входа.
export const ACCESS_KEY = 'trainapp_access_token_v2'
export const REFRESH_KEY = 'trainapp_refresh_token_v2'

const LEGACY_KEYS = ['trainapp_access_token', 'trainapp_refresh_token']

export function cleanupLegacyTokens() {
  try {
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key))
  } catch { /* noop */ }
}
