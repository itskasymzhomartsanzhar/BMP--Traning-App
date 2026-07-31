import { useState } from 'react'
import Modal from '../../../components/organisms/Modal/Modal'
import WheelPicker from '../../../components/common/WheelPicker'
import { useAppUI } from '../../../context/AppUIContext'

const LANGUAGES = [
  { id: 'ru', label: 'Русский' },
  { id: 'en', label: 'English' },
]

const UNITS = [
  { id: 'metric', label: 'кг · см' },
  { id: 'imperial', label: 'lb · in' },
]

function SettingsModal({ user, onSave, onClose }) {
  const { t } = useAppUI()
  const [language, setLanguage] = useState(user?.language || 'ru')
  const [units, setUnits] = useState(user?.units || 'metric')

  const save = () => {
    onSave({ language, units })
    onClose()
  }

  return (
    <Modal title={t('profile.settings')} onClose={onClose} className="personal-modal">
      <div className="settings-modal__group">
        <p className="settings-modal__label">{t('profile.language')}</p>
        <WheelPicker options={LANGUAGES} value={language} onChange={setLanguage} />
      </div>

      <div className="settings-modal__group">
        <p className="settings-modal__label">{t('profile.units')}</p>
        <WheelPicker options={UNITS} value={units} onChange={setUnits} />
      </div>

      <div className="personal-form__actions">
        <button type="button" className="secondary" onClick={onClose}>{t('common.cancel')}</button>
        <button type="button" className="primary" onClick={save}>{t('common.save')}</button>
      </div>
    </Modal>
  )
}

export default SettingsModal
