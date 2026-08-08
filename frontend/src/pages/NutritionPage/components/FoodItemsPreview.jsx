import { useState } from 'react'
import { FaXmark } from 'react-icons/fa6'
import { useAppUI } from '../../../context/AppUIContext'
import { scaleItem, sumItems } from './foodUtils'

/* Распознанные позиции перед сохранением: граммы можно поправить —
   КБЖУ пересчитываются пропорционально, позицию можно убрать. */
function FoodItemsPreview({ items, onConfirm, onRetry, retryLabel, busy }) {
  const { t } = useAppUI()
  // base — исходная оценка ИИ, item — текущая (после правок граммов).
  const [rows, setRows] = useState(() => items.map((item, index) => ({ id: index, base: item, item })))

  const handleGrams = (id, raw) => {
    const grams = Number(String(raw).replace(',', '.'))
    setRows((prev) => prev.map((row) => {
      if (row.id !== id) return row
      if (!Number.isFinite(grams) || grams <= 0 || grams > 5000) return { ...row, item: { ...row.item, grams: raw } }
      return { ...row, item: scaleItem(row.base, grams) }
    }))
  }

  const removeRow = (id) => setRows((prev) => prev.filter((row) => row.id !== id))

  const valid = rows.filter((row) => Number.isFinite(Number(row.item.grams)) && Number(row.item.grams) > 0)
  const totals = sumItems(valid.map((row) => row.item))

  return (
    <div className="food-preview">
      <ul className="food-preview__list">
        {rows.map((row) => (
          <li key={row.id} className="food-preview__row">
            <div className="food-preview__info">
              <strong>{row.item.name}</strong>
              <span>
                {Math.round(row.item.calories)} {t('home.kcal')}
                {' · '}{t('nutrition.proteinShort')} {Math.round(row.item.protein)}
                {' '}{t('nutrition.fatsShort')} {Math.round(row.item.fats)}
                {' '}{t('nutrition.carbsShort')} {Math.round(row.item.carbs)}
              </span>
            </div>
            <label className="food-preview__grams">
              <input
                type="number"
                inputMode="decimal"
                min="1"
                max="5000"
                value={row.item.grams}
                onChange={(e) => handleGrams(row.id, e.target.value)}
              />
              <span>{t('nutrition.grams')}</span>
            </label>
            <button type="button" className="food-preview__remove" onClick={() => removeRow(row.id)} aria-label={t('common.delete')}>
              <FaXmark />
            </button>
          </li>
        ))}
      </ul>

      <div className="food-preview__total">
        <span>{t('food.total')}</span>
        <strong>
          {Math.round(totals.calories)} {t('home.kcal')}
          {' · '}{t('nutrition.proteinShort')} {Math.round(totals.protein)}
          {' '}{t('nutrition.fatsShort')} {Math.round(totals.fats)}
          {' '}{t('nutrition.carbsShort')} {Math.round(totals.carbs)}
        </strong>
      </div>

      <div className="modal__actions">
        <button type="button" className="secondary" onClick={onRetry} disabled={busy}>{retryLabel}</button>
        <button
          type="button"
          className="primary"
          disabled={busy || valid.length === 0}
          onClick={() => onConfirm(valid.map((row) => ({
            name: row.item.name,
            grams: Number(row.item.grams),
            calories: row.item.calories,
            protein: row.item.protein,
            fats: row.item.fats,
            carbs: row.item.carbs,
          })))}
        >
          {busy ? t('common.loading') : t('food.add')}
        </button>
      </div>
    </div>
  )
}

export default FoodItemsPreview
