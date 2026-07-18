function PhotoProgressCard({ photos, onPhotoClick }) {
  return (
    <div className="card photo-card animate-in delay-2">
      <h2>Фото прогресса</h2>
      {photos.length > 0 ? (
        <div className="photo-grid">
          {photos.map((date) => (
            <button type="button" key={date} className="photo-tile" onClick={() => onPhotoClick?.(date)}>
              <span>{date}</span>
              <small>Фронт / бок</small>
            </button>
          ))}
        </div>
      ) : (
        <p className="photo-card__empty">
          делаем потом.
        </p>
      )}
    </div>
  )
}

export default PhotoProgressCard
