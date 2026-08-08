import { useEffect, useRef, useState } from 'react'
import { FaChevronLeft } from 'react-icons/fa6'
import Modal from '../../../components/organisms/Modal/Modal'
import { useAppUI } from '../../../context/AppUIContext'
import { searchFood, addFoodEntries } from '../../../api/nutrition'
import { portionFromPer100, apiErrorText } from './foodUtils'

const today = () => new Date().toISOString().slice(0, 10)

const parseNumber = (raw) => Number(String(raw).replace(',', '.'))

/* Поиск по базе Open Food Facts + добавление своей позиции вручную. */
function SearchFoodModal({ onAdded, onClose }) {
  const { showToast, t } = useAppUI()
  const [query, setQuery] = useState('')
  // Результат привязан к запросу — «загрузка» выводится, пока они не совпали.
  const [results, setResults] = useState(null)
  const [picked, setPicked] = useState(null)
  const [grams, setGrams] = useState('100')
  const [manual, setManual] = useState(false)
  const [form, setForm] = useState({ name: '', grams: '100', calories: '', protein: '', fats: '', carbs: '' })
  const [saving, setSaving] = useState(false)
  const debounceRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    const trimmed = query.trim()
    if (trimmed.length < 2) return undefined
    debounceRef.current = setTimeout(() => {
      searchFood(trimmed)
        .then(({ data }) => setResults({ query: trimmed, items: data.items }))
        .catch(() => setResults({ query: trimmed, items: [] }))
    }, 450)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  const trimmedQuery = query.trim()
  const items = trimmedQuery.length >= 2 && results?.query === trimmedQuery ? results.items : null
  const loading = trimmedQuery.length >= 2 && !items

  const save = (entries, source) => {
    setSaving(true)
    addFoodEntries(today(), entries, source)
      .then(({ data }) => {
        onAdded(data)
        showToast(t('food.added'))
        onClose()
      })
      .catch((err) => showToast(apiErrorText(err, t('food.addError'))))
      .finally(() => setSaving(false))
  }

  const gramsNumber = parseNumber(grams)
  const portion = picked && Number.isFinite(gramsNumber) && gramsNumber > 0
    ? portionFromPer100(picked.per100, gramsNumber)
    : null

  const manualEntry = (() => {
    const name = form.name.trim()
    const g = parseNumber(form.grams)
    const kcal = parseNumber(form.calories)
    if (!name || !Number.isFinite(g) || g <= 0 || !Number.isFinite(kcal) || kcal < 0) return null
    const macro = (raw) => {
      const value = parseNumber(raw)
      return Number.isFinite(value) && value >= 0 ? value : 0
    }
    return {
      name,
      grams: g,
      calories: kcal,
      protein: macro(form.protein),
      fats: macro(form.fats),
      carbs: macro(form.carbs),
    }
  })()

  const setField = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  return (
    <Modal title={t('food.searchTitle')} onClose={onClose} className="food-modal">
      {!picked && !manual && (
        <>
          <input
            ref={inputRef}
            className="modal__input"
            type="search"
            placeholder={t('food.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {loading && (
            <div className="food-modal__status">
              <span className="food-modal__spinner" aria-hidden="true" />
              {t('common.loading')}
            </div>
          )}

          {!loading && items && items.length === 0 && (
            <p className="food-modal__note">{t('food.searchEmpty')}</p>
          )}

          {!loading && items && items.length > 0 && (
            <ul className="food-search__list">
              {items.map((item) => (
                <li key={`${item.code}-${item.name}`}>
                  <button type="button" className="food-search__item" onClick={() => { setPicked(item); setGrams('100') }}>
                    <span className="food-search__name">
                      <strong>{item.name}</strong>
                      {item.brand ? <span>{item.brand}</span> : null}
                    </span>
                    <span className="food-search__kcal">
                      {Math.round(item.per100.calories)} {t('home.kcal')}
                      <em>{t('food.per100')}</em>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button type="button" className="food-search__manual-link" onClick={() => setManual(true)}>
            {t('food.manualAdd')}
          </button>
        </>
      )}

      {picked && (
        <>
          <button type="button" className="food-modal__back" onClick={() => setPicked(null)}>
            <FaChevronLeft aria-hidden="true" /> {t('common.back')}
          </button>
          <div className="food-product">
            <div className="food-product__info">
              <strong>{picked.name}</strong>
              {picked.brand ? <span>{picked.brand}</span> : null}
              <span>
                {Math.round(picked.per100.calories)} {t('home.kcal')}
                {' · '}{t('nutrition.proteinShort')} {Math.round(picked.per100.protein || 0)}
                {' '}{t('nutrition.fatsShort')} {Math.round(picked.per100.fats || 0)}
                {' '}{t('nutrition.carbsShort')} {Math.round(picked.per100.carbs || 0)}
                {' '}{t('food.per100')}
              </span>
            </div>
          </div>

          <label className="food-portion">
            <span>{t('food.portion')}</span>
            <input type="number" inputMode="decimal" min="1" max="5000" value={grams} onChange={(e) => setGrams(e.target.value)} />
          </label>

          {portion && (
            <div className="food-preview__total">
              <span>{t('food.total')}</span>
              <strong>
                {Math.round(portion.calories)} {t('home.kcal')}
                {' · '}{t('nutrition.proteinShort')} {Math.round(portion.protein)}
                {' '}{t('nutrition.fatsShort')} {Math.round(portion.fats)}
                {' '}{t('nutrition.carbsShort')} {Math.round(portion.carbs)}
              </strong>
            </div>
          )}

          <div className="modal__actions">
            <button type="button" className="secondary" onClick={() => setPicked(null)}>{t('common.cancel')}</button>
            <button
              type="button"
              className="primary"
              disabled={!portion || saving}
              onClick={() => save([{ name: picked.brand ? `${picked.name} · ${picked.brand}` : picked.name, ...portion }], 'manual')}
            >
              {saving ? t('common.loading') : t('food.add')}
            </button>
          </div>
        </>
      )}

      {manual && (
        <>
          <button type="button" className="food-modal__back" onClick={() => setManual(false)}>
            <FaChevronLeft aria-hidden="true" /> {t('common.back')}
          </button>
          <div className="food-manual">
            <label>
              <span>{t('food.name')}</span>
              <input type="text" value={form.name} onChange={setField('name')} placeholder={t('food.namePlaceholder')} />
            </label>
            <div className="food-manual__grid">
              <label>
                <span>{t('food.portion')}</span>
                <input type="number" inputMode="decimal" value={form.grams} onChange={setField('grams')} />
              </label>
              <label>
                <span>{t('nutrition.calories')}</span>
                <input type="number" inputMode="decimal" value={form.calories} onChange={setField('calories')} placeholder="250" />
              </label>
              <label>
                <span>{t('nutrition.protein')}</span>
                <input type="number" inputMode="decimal" value={form.protein} onChange={setField('protein')} placeholder="0" />
              </label>
              <label>
                <span>{t('nutrition.fats')}</span>
                <input type="number" inputMode="decimal" value={form.fats} onChange={setField('fats')} placeholder="0" />
              </label>
              <label>
                <span>{t('nutrition.carbs')}</span>
                <input type="number" inputMode="decimal" value={form.carbs} onChange={setField('carbs')} placeholder="0" />
              </label>
            </div>
          </div>
          <div className="modal__actions">
            <button type="button" className="secondary" onClick={() => setManual(false)}>{t('common.cancel')}</button>
            <button type="button" className="primary" disabled={!manualEntry || saving} onClick={() => save([manualEntry], 'manual')}>
              {saving ? t('common.loading') : t('food.add')}
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}

export default SearchFoodModal
