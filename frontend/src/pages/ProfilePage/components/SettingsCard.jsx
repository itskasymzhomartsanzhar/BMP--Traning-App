import { useState } from 'react'
import { FaTelegram } from 'react-icons/fa6'
import { useAppUI, isTelegramMiniApp } from '../../../context/AppUIContext'
import Modal from '../../../components/organisms/Modal/Modal'
import TelegramLoginButton, { telegramWidgetConfigured } from '../../../components/common/TelegramLoginButton'

function SettingsCard() {
  const { showInfo, showToast, showConfirm, userProfile, updateUserProfile, linkTelegramAccount, logout, t } = useAppUI()
  const [tgModalOpen, setTgModalOpen] = useState(false)

  const pushOn = userProfile?.push_notifications ?? true
  const hasTelegram = Boolean(userProfile?.tg_id)
  const insideTMA = isTelegramMiniApp()

  // updateUserProfile сам отправляет PATCH — второй запрос был бы дублем.
  const toggle = (field, currentVal) => {
    updateUserProfile({ [field]: !currentVal })
  }

  const handleLinkTelegram = () => {
    if (!telegramWidgetConfigured) {
      showInfo(
        'Подключение Telegram',
        'Вход через Telegram не настроен.\n\nЗадайте VITE_TG_LOGIN_CLIENT_ID в .env фронтенда (Client ID из BotFather: My Bots → Bot Settings → Web Login) и добавьте домен сайта в Allowed URLs там же.',
      )
      return
    }
    setTgModalOpen(true)
  }

  const onTelegramAuth = (widgetUser) => {
    linkTelegramAccount(widgetUser)
      .then(() => {
        setTgModalOpen(false)
      })
      .catch((err) => {
        setTgModalOpen(false)
        showToast(err.response?.data?.detail || 'Не удалось подключить Telegram')
      })
  }

  return (
    <div className="card settings-card animate-in delay-3">
      <h2>{t('profile.settings')}</h2>

      <button type="button" className="toggle-row" onClick={() => toggle('push_notifications', pushOn)}>
        <span>{t('profile.push')}</span>
        <span className={pushOn ? 'toggle is-on' : 'toggle'}>{pushOn ? t('profile.yes') : t('profile.no')}</span>
      </button>

      {!hasTelegram && (
        <button type="button" className="toggle-row settings-tg-link" onClick={handleLinkTelegram}>
          <span><FaTelegram aria-hidden="true" /> {t('profile.linkTelegram')}</span>
          <span className="arrow">›</span>
        </button>
      )}

      {!insideTMA && (
        <button
          type="button"
          className="toggle-row settings-logout"
          onClick={() => showConfirm(t('profile.logoutTitle'), t('profile.logoutConfirm'), logout, t('profile.logoutAction'))}
        >
          <span>{t('profile.logout')}</span>
          <span className="arrow">›</span>
        </button>
      )}

      {tgModalOpen && (
        <Modal
          title="Подключить Telegram"
          message="Нажмите кнопку ниже и подтвердите вход в Telegram — аккаунты свяжутся."
          onClose={() => setTgModalOpen(false)}
          actions={[{ label: 'Отмена', variant: 'secondary', onClick: () => {} }]}
        >
          <TelegramLoginButton
            onAuth={onTelegramAuth}
            onError={(err) => {
              if (['Telegram login was cancelled', 'popup_closed'].includes(String(err?.message))) return
              showToast('Подключение Telegram не завершилось. Попробуйте ещё раз.')
            }}
          />
        </Modal>
      )}
    </div>
  )
}

export default SettingsCard
