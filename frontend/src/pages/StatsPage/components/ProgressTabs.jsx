function ProgressTabs({ activeTab, onChange }) {
  return (
    <div className="tab-row animate-in delay-1">
      <button type="button" className={activeTab === 'dynamics' ? 'tab is-active' : 'tab'} onClick={() => onChange('dynamics')}>
        Динамика
      </button>
      <button
        type="button"
        className={activeTab === 'measurements' ? 'tab is-active' : 'tab'}
        onClick={() => onChange('measurements')}
      >
        Замеры
      </button>
      <button type="button" className={activeTab === 'photo' ? 'tab is-active' : 'tab'} onClick={() => onChange('photo')}>
        Фото
      </button>
    </div>
  )
}

export default ProgressTabs
