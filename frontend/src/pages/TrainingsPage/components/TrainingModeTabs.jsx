import { useAppUI } from '../../../context/AppUIContext'

function TrainingModeTabs({ mode, onChange }) {
  const { t } = useAppUI()
  return (
    <div className="training-mode-tabs animate-in delay-1">
      <button
        type="button"
        className={mode === 'gym' ? 'training-mode-tab is-active' : 'training-mode-tab'}
        onClick={() => onChange('gym')}
      >
        {t('trainings.gymTab')}
      </button>

      <button
        type="button"
        className={mode === 'home' ? 'training-mode-tab is-active' : 'training-mode-tab'}
        onClick={() => onChange('home')}
      >
        {t('trainings.homeTab')}
      </button>
    </div>
  )
}

export default TrainingModeTabs
