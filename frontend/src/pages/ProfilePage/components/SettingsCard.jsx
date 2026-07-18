import { useState } from 'react'
import { FaTelegram } from 'react-icons/fa6'
import { useAppUI, isTelegramMiniApp } from '../../../context/AppUIContext'
import Modal from '../../../components/organisms/Modal/Modal'
import TelegramLoginButton, { telegramWidgetConfigured } from '../../../components/common/TelegramLoginButton'

function SettingsCard() {
  const { showInfo, showToast, showConfirm, userProfile, updateUserProfile, linkTelegramAccount, logout } = useAppUI()
  const [tgModalOpen, setTgModalOpen] = useState(false)

  const pushOn = userProfile?.push_notifications ?? true
  const emailOn = userProfile?.email_newsletter ?? false
  const hasTelegram = Boolean(userProfile?.tg_id)
  const insideTMA = isTelegramMiniApp()

  // updateUserProfile сам отправляет PATCH — второй запрос был бы дублем.
  const toggle = (field, currentVal) => {
    updateUserProfile({ [field]: !currentVal })
  }

  const handleAccountInfo = () => {
    if (hasTelegram) {
      showInfo('Аккаунт', 'Вход через Telegram. Пароль не используется.')
    } else {
      showInfo('Аккаунт', `Вход по почте: ${userProfile?.email || '—'}`)
    }
  }

  const handleLinkTelegram = () => {
    if (!telegramWidgetConfigured) {
      showInfo(
        'Подключение Telegram',
        'Виджет входа не настроен.\n\nЗадайте VITE_TG_BOT_USERNAME в .env фронтенда и привяжите домен к боту командой /setdomain в BotFather.',
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
      <h2>Настройки</h2>

      <button type="button" className="toggle-row" onClick={() => toggle('push_notifications', pushOn)}>
        <span>Push-уведомления</span>
        <span className={pushOn ? 'toggle is-on' : 'toggle'}>{pushOn ? 'ДА' : 'НЕТ'}</span>
      </button>

      <button type="button" className="toggle-row" onClick={() => toggle('email_newsletter', emailOn)}>
        <span>Email-рассылка</span>
        <span className={emailOn ? 'toggle is-on' : 'toggle'}>{emailOn ? 'ДА' : 'НЕТ'}</span>
      </button>

      <button type="button" className="toggle-row" onClick={handleAccountInfo}>
        <span>Аккаунт</span>
        <span className="arrow">›</span>
      </button>

      {!hasTelegram && (
        <button type="button" className="toggle-row settings-tg-link" onClick={handleLinkTelegram}>
          <span><FaTelegram aria-hidden="true" /> Подключить Telegram</span>
          <span className="arrow">›</span>
        </button>
      )}

      {!insideTMA && (
        <button
          type="button"
          className="toggle-row settings-logout"
          onClick={() => showConfirm('Выход', 'Выйти из аккаунта?', logout, 'Выйти')}
        >
          <span>Выйти из аккаунта</span>
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
          <TelegramLoginButton onAuth={onTelegramAuth} />
        </Modal>
      )}
    </div>
  )
}

export default SettingsCard
