import { useAppUI } from '../../../context/AppUIContext'
import { useState } from 'react'
import { FaCamera } from 'react-icons/fa6'

/**
 * Просмотр прогресса: фотографии сняты по одной сетке, поэтому ползунок
 * плавно «переливает» один кадр в другой — изменения тела видны наглядно.
 */
function PhotoProgressCard({ photos, onAdd }) {
  const { t } = useAppUI()
  const [position, setPosition] = useState(0)

  const count = photos.length
  const active = Math.min(count - 1, Math.max(0, Math.round(position)))

  return (
    <div className="card photo-card animate-in delay-2">
      <h2>{t('stats.photoProgress')}</h2>

      {count === 0 && (
        <p className="photo-card__empty">{t('stats.photoEmpty')}</p>
      )}

      {count > 0 && (
        <>
          <div className="photo-viewer">
            {photos.map((photo, index) => (
              <img
                key={photo.id}
                src={photo.url}
                alt={`Фото от ${photo.date_display}`}
                className="photo-viewer__img"
                style={{ opacity: Math.max(0, 1 - Math.abs(position - index)) }}
                draggable="false"
              />
            ))}
            <span className="photo-viewer__date">{photos[active]?.date_display}</span>
          </div>

          {count > 1 && (
            <div className="photo-slider">
              <input
                type="range"
                min="0"
                max={count - 1}
                step="0.01"
                value={position}
                onChange={(e) => setPosition(Number(e.target.value))}
                aria-label="Перемотка фото прогресса"
              />
              <div className="photo-slider__labels">
                <span>{photos[0].date_display}</span>
                <span>{photos[count - 1].date_display}</span>
              </div>
            </div>
          )}
        </>
      )}

      <button type="button" className="primary photo-card__add" onClick={onAdd}>
        <FaCamera aria-hidden="true" /> {t('stats.addPhoto')}
      </button>
    </div>
  )
}

export default PhotoProgressCard
