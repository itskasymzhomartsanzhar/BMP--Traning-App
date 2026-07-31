import { useAppUI } from '../../../context/AppUIContext'

function ProgressTabs({ activeTab, onChange }) {
  const { t } = useAppUI()
  return (
    <div className="tab-row animate-in delay-1">
      <button type="button" className={activeTab === 'dynamics' ? 'tab is-active' : 'tab'} onClick={() => onChange('dynamics')}>
        {t('stats.tabDynamics')}
      </button>
      <button
        type="button"
        className={activeTab === 'measurements' ? 'tab is-active' : 'tab'}
        onClick={() => onChange('measurements')}
      >
        {t('stats.tabMeasurements')}
      </button>
      <button type="button" className={activeTab === 'photo' ? 'tab is-active' : 'tab'} onClick={() => onChange('photo')}>
        {t('stats.tabPhoto')}
      </button>
    </div>
  )
}

export default ProgressTabs
