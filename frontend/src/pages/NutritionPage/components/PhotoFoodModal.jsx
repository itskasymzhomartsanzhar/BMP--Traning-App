import { useEffect, useMemo, useState } from 'react'
import Modal from '../../../components/organisms/Modal/Modal'
import { useAppUI } from '../../../context/AppUIContext'
import { analyzeFoodPhoto, addFoodEntries } from '../../../api/nutrition'
import FoodItemsPreview from './FoodItemsPreview'
import { compressImage, apiErrorText } from './foodUtils'

const today = () => new Date().toISOString().slice(0, 10)

/* Фото уже выбрано (камера открывается прямо с кнопки FAB) —
   модалка показывает превью, распознаёт и даёт подтвердить. */
function PhotoFoodModal({ file, onRetake, onAdded, onClose }) {
  const { showToast, t } = useAppUI()
  // Результат привязан к файлу: после «Переснять» старый ответ не показывается.
  const [analysis, setAnalysis] = useState(null)
  const [saving, setSaving] = useState(false)

  const preview = useMemo(() => URL.createObjectURL(file), [file])
  useEffect(() => () => URL.revokeObjectURL(preview), [preview])

  useEffect(() => {
    let alive = true
    compressImage(file)
      .then((compact) => analyzeFoodPhoto(compact))
      .then(({ data }) => { if (alive) setAnalysis({ file, result: data }) })
      .catch((err) => { if (alive) setAnalysis({ file, error: apiErrorText(err, t('food.aiError')) }) })
    return () => { alive = false }
  }, [file, t])

  const result = analysis?.file === file ? analysis.result : null
  const error = analysis?.file === file ? analysis.error : null

  const handleConfirm = (items) => {
    setSaving(true)
    addFoodEntries(today(), items, 'photo')
      .then(({ data }) => {
        onAdded(data)
        showToast(t('food.added'))
        onClose()
      })
      .catch((err) => showToast(apiErrorText(err, t('food.addError'))))
      .finally(() => setSaving(false))
  }

  const empty = result && result.items.length === 0

  return (
    <Modal title={t('food.photoTitle')} onClose={onClose} className="food-modal">
      {preview && <img className="food-modal__photo" src={preview} alt="" />}

      {!result && !error && (
        <div className="food-modal__status">
          <span className="food-modal__spinner" aria-hidden="true" />
          {t('food.analyzing')}
        </div>
      )}

      {error && (
        <>
          <p className="food-modal__error">{error}</p>
          <div className="modal__actions">
            <button type="button" className="secondary" onClick={onClose}>{t('common.cancel')}</button>
            <button type="button" className="primary" onClick={onRetake}>{t('food.retake')}</button>
          </div>
        </>
      )}

      {empty && (
        <>
          <p className="food-modal__error">{result.comment || t('food.nothing')}</p>
          <div className="modal__actions">
            <button type="button" className="secondary" onClick={onClose}>{t('common.cancel')}</button>
            <button type="button" className="primary" onClick={onRetake}>{t('food.retake')}</button>
          </div>
        </>
      )}

      {result && result.items.length > 0 && (
        <>
          {result.comment ? <p className="food-modal__note">{result.comment}</p> : null}
          <FoodItemsPreview
            key={result.items.map((item) => item.name).join('|')}
            items={result.items}
            onConfirm={handleConfirm}
            onRetry={onRetake}
            retryLabel={t('food.retake')}
            busy={saving}
          />
        </>
      )}
    </Modal>
  )
}

export default PhotoFoodModal
