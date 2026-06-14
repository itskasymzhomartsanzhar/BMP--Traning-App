function TrainingModeTabs({ mode, onChange }) {
  return (
    <div className="training-mode-tabs animate-in delay-1">
      <button
        type="button"
        className={mode === 'gym' ? 'training-mode-tab is-active' : 'training-mode-tab'}
        onClick={() => onChange('gym')}
      >
        Тренировка в зале
      </button>

      <button
        type="button"
        className={mode === 'home' ? 'training-mode-tab is-active' : 'training-mode-tab'}
        onClick={() => onChange('home')}
      >
        Дома
      </button>
    </div>
  )
}

export default TrainingModeTabs
