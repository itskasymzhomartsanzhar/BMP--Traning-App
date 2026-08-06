import { useState } from 'react'
import { FaTelegram } from 'react-icons/fa6'
import { useAppUI, isTelegramMiniApp } from '../../../context/AppUIContext'
import Modal from '../../../components/organisms/Modal/Modal'
import TelegramLoginButton, { telegramWidgetConfigured } from '../../../components/common/TelegramLoginButton'

function SettingsCard() {
  const { showInfo, showToast, showConfirm, userProfile, updateUserProfile, linkTelegramAccount, logout, t } = useAppUI()
  const [tgModalOpen, setTgModalOpen] = useState(false)

  const hasTelegram = Boolean(userProfile?.tg_id)
  const insideTMA = isTelegramMiniApp()
  // Пуши идут через Telegram-бота: без подключённого Telegram слать
  // некуда, поэтому тумблер показывает НЕТ независимо от флага в БД.
  const pushStored = userProfile?.push_notifications ?? true
  const pushOn = hasTelegram && pushStored

  // updateUserProfile сам отправляет PATCH — второй запрос был бы дублем.
  const toggle = (field, currentVal) => {
    updateUserProfile({ [field]: !currentVal })
  }

  // Без Telegram клик по тумблеру сразу запускает подключение —
  // как если бы нажали «Подключить Telegram».
  const handlePushToggle = () => {
    if (!hasTelegram) {
      handleLinkTelegram()
      return
    }
    toggle('push_notifications', pushStored)
  }

  const handleLinkTelegram = () => {
    if (!telegramWidgetConfigured) {
      showInfo(t('profile.tgLinkTitle'), t('profile.tgNotConfigured'))
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
        showToast(err.response?.data?.detail || t('profile.tgLinkError'))
      })
  }

  return (
    <div className="card settings-card animate-in delay-3">
      <h2>{t('profile.settings')}</h2>

      <button type="button" className="toggle-row" onClick={handlePushToggle}>
        <span>{t('profile.push')}</span>
        <span className={pushOn ? 'toggle is-on' : 'toggle'}>{pushOn ? t('profile.yes') : t('profile.no')}</span>
      </button>

      {/* Внутри мини-аппа Telegram уже подключён по определению — кнопка не нужна. */}
      {!hasTelegram && !insideTMA && (
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
          title={t('profile.linkTelegram')}
          message={t('profile.tgLinkMessage')}
          onClose={() => setTgModalOpen(false)}
          actions={[{ label: t('common.cancel'), variant: 'secondary', onClick: () => {} }]}
        >
          <TelegramLoginButton
            onAuth={onTelegramAuth}
            onError={(err) => {
              if (['Telegram login was cancelled', 'popup_closed'].includes(String(err?.message))) return
              showToast(t('profile.tgLinkIncomplete'))
            }}
          />
        </Modal>
      )}
    </div>
  )
}

export default SettingsCard
