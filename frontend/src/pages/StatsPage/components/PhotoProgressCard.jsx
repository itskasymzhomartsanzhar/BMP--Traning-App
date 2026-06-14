function PhotoProgressCard({ photos, onAction }) {
  return (
    <div className="card photo-card animate-in delay-2">
      <h2>Фото прогресса</h2>
      <div className="photo-grid">
        {photos.map((date) => (
          <button type="button" key={date} className="photo-tile" onClick={() => onAction(`Открыто фото от ${date}`)}>
            <span>{date}</span>
            <small>Фронт / бок</small>
          </button>
        ))}
      </div>
      <button type="button" className="primary" onClick={() => onAction('Кнопка загрузки фото нажата')}>
        Добавить фото
      </button>
    </div>
  )
}

export default PhotoProgressCard
