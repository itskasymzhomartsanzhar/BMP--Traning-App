import { useEffect, useRef, useState } from 'react'
import { FaArrowDown, FaArrowUp, FaBullseye, FaGlassWater, FaMinus, FaPen, FaPercent, FaPlus, FaWeightScale, FaXmark } from 'react-icons/fa6'
import { useAppUI } from '../../context/AppUIContext'
import { getNutritionDay, updateNutritionDay, addWater, deleteFoodEntry } from '../../api/nutrition'
import { getMeasurements, addMeasurement, addWeight } from '../../api/analytics'
import SectionHead from '../../components/common/SectionHead'
import FoodFab from './components/FoodFab'
import PhotoFoodModal from './components/PhotoFoodModal'
import VoiceFoodModal from './components/VoiceFoodModal'
import BarcodeFoodModal from './components/BarcodeFoodModal'
import SearchFoodModal from './components/SearchFoodModal'
import './NutritionPage.scss'
import './components/FoodAdd.scss'

const today = () => new Date().toISOString().slice(0, 10)

const parseNumber = (raw) => Number(String(raw).replace(',', '.'))

// Та же формула, что на главной и в калькуляторе: Миффлин-Сан Жеор.
function calcBmr(profile) {
  const weight = Number(profile?.weight)
  const height = Number(profile?.height)
  const age = Number(profile?.age)
  if (!Number.isFinite(weight) || !Number.isFinite(height) || !Number.isFinite(age) || !weight || !height || !age) {
    return null
  }
  return profile?.gender === 'female'
    ? 10 * weight + 6.25 * height - 5 * age - 161
    : 10 * weight + 6.25 * height - 5 * age + 5
}

const GOAL_IDS = ['cut', 'recomp', 'bulk']

function NutritionPage() {
  const { showToast, showModal, showCalculator, userProfile, updateUserProfile, t, u } = useAppUI()
  const [day, setDay] = useState(null)
  const [bodyFat, setBodyFat] = useState(null)
  const [foodModal, setFoodModal] = useState(null) // photo | voice | barcode | search
  const [photoFile, setPhotoFile] = useState(null)
  const photoInputRef = useRef(null)

  useEffect(() => {
    getNutritionDay().then(({ data }) => setDay(data)).catch(() => {})
  }, [])

  const loadBodyFat = () => {
    getMeasurements()
      .then(({ data }) => {
        const entry = Array.isArray(data) ? data.find((item) => item.field === 'body_fat_percent') : null
        setBodyFat(entry ? parseFloat(entry.value) : null)
      })
      .catch(() => {})
  }

  useEffect(loadBodyFat, [])

  const reload = () => getNutritionDay().then(({ data }) => setDay(data))

  // delta ±0.25 л — кнопки плюс/минус на карточке воды.
  const handleWaterChange = (delta) => {
    addWater(delta, today())
      .then(reload)
      .catch(() => showToast(t('nutrition.waterError')))
  }

  const handleEditMacro = (macro) => {
    showModal({
      title: t('nutrition.editTarget', { label: macro.label }),
      message: t('nutrition.editTargetMessage'),
      input: { type: 'number', step: '1', defaultValue: macro.value, placeholder: '170' },
      actions: [
        { label: t('common.cancel'), variant: 'secondary', onClick: () => {} },
        {
          label: t('common.save'),
          variant: 'primary',
          onClick: (inputValue) => {
            const grams = Math.round(parseNumber(inputValue))
            if (!Number.isFinite(grams) || grams < 0 || grams > 1000) {
              showToast(t('nutrition.macroError'))
              return
            }
            updateNutritionDay(today(), { [macro.field]: grams })
              .then(reload)
              .catch(() => showToast(t('nutrition.saveError')))
          },
        },
      ],
    })
  }

  const handleEditCalories = () => {
    showModal({
      title: t('nutrition.editTarget', { label: t('nutrition.calories') }),
      message: t('nutrition.editCaloriesMessage'),
      input: { type: 'number', step: '10', defaultValue: day?.target_calories, placeholder: '2200' },
      actions: [
        { label: t('common.cancel'), variant: 'secondary', onClick: () => {} },
        {
          label: t('common.save'),
          variant: 'primary',
          onClick: (inputValue) => {
            const kcal = Math.round(parseNumber(inputValue))
            if (!Number.isFinite(kcal) || kcal < 500 || kcal > 10000) {
              showToast(t('nutrition.caloriesError'))
              return
            }
            updateNutritionDay(today(), { target_calories: kcal })
              .then(reload)
              .catch(() => showToast(t('nutrition.saveError')))
          },
        },
      ],
    })
  }

  const handleEditGoal = () => {
    showModal({
      title: t('home.goal'),
      message: t('nutrition.chooseGoalMessage'),
      actions: [
        ...GOAL_IDS.map((goalId) => ({
          label: t(`goals.${goalId}`),
          variant: 'primary',
          onClick: () => updateUserProfile({ goal: goalId }),
        })),
        { label: t('common.cancel'), variant: 'secondary', onClick: () => {} },
      ],
    })
  }

  const handleEditWeight = () => {
    showModal({
      title: t('stats.addWeightTitle'),
      message: t('stats.addWeightMessage', { unit: u.weightLabel }),
      input: { type: 'number', step: '0.1', defaultValue: userProfile?.weight ? u.weight(userProfile.weight) : '', placeholder: t('stats.addWeightPlaceholder', { example: u.imperial ? 160 : 72.5 }) },
      actions: [
        { label: t('common.cancel'), variant: 'secondary', onClick: () => {} },
        {
          label: t('common.save'),
          variant: 'primary',
          onClick: (inputValue) => {
            // Ввод в выбранной системе, в API — килограммы.
            const kg = Number(u.weightToKg(parseNumber(inputValue)).toFixed(1))
            if (!Number.isFinite(kg) || kg < 20 || kg > 300) {
              showToast(t('stats.weightError'))
              return
            }
            // Пишем замером, чтобы точка попала и в график на Аналитике.
            addWeight(kg, today())
              .then(() => updateUserProfile({ weight: kg }))
              .catch(() => showToast(t('stats.weightSaveError')))
          },
        },
      ],
    })
  }

  const handleEditBodyFat = () => {
    showModal({
      title: t('nutrition.bodyFat'),
      message: t('nutrition.bodyFatMessage'),
      input: { type: 'number', step: '0.1', defaultValue: bodyFat ?? '', placeholder: '19.3' },
      actions: [
        { label: t('common.cancel'), variant: 'secondary', onClick: () => {} },
        {
          label: t('common.save'),
          variant: 'primary',
          onClick: (inputValue) => {
            const percent = parseNumber(inputValue)
            if (!Number.isFinite(percent) || percent < 1 || percent > 70) {
              showToast(t('nutrition.bodyFatError'))
              return
            }
            addMeasurement({ body_fat_percent: Number(percent.toFixed(1)), recorded_at: today() })
              .then(loadBodyFat)
              .catch(() => showToast(t('nutrition.saveError')))
          },
        },
      ],
    })
  }

  const handlePhotoPicked = (e) => {
    const file = e.target.files?.[0]
    // Сбрасываем value, чтобы «Переснять» с тем же файлом снова сработал.
    e.target.value = ''
    if (!file) return
    setPhotoFile(file)
    setFoodModal('photo')
  }

  const handleDeleteEntry = (entryId) => {
    deleteFoodEntry(entryId)
      .then(({ data }) => setDay(data))
      .catch(() => showToast(t('food.deleteError')))
  }

  const eaten = day?.eaten
  const entries = day?.entries

  const macros = day ? [
    { field: 'target_protein', label: t('nutrition.protein'), value: day?.target_protein, eaten: eaten?.protein },
    { field: 'target_fats', label: t('nutrition.fats'), value: day?.target_fats, eaten: eaten?.fats },
    { field: 'target_carbs', label: t('nutrition.carbs'), value: day?.target_carbs, eaten: eaten?.carbs },
  ] : []

  const caloriesPercent = day?.target_calories
    ? Math.min(100, Math.round(((eaten?.calories ?? 0) / day.target_calories) * 100))
    : 0
  const caloriesOver = Boolean(day?.target_calories && (eaten?.calories ?? 0) > day.target_calories)

  const bmr = calcBmr(userProfile)
  const tdee = bmr ? Math.round(bmr * 1.55) : null
  const delta = day && tdee ? day?.target_calories - tdee : null

  const goal = ['cut', 'recomp', 'bulk', 'maintain', 'endurance'].includes(userProfile?.goal)
    ? { label: t(`goals.${userProfile.goal}`), hint: t(`goalHints.${userProfile.goal}`) }
    : { label: t('home.goal'), hint: t('home.fillSurvey') }

  return (
    <section className="page page-nutrition">
      <SectionHead title={t('nutrition.title')} />

      {day && (
        <>
          <div className="nutrition-hero animate-in delay-1">
            <button type="button" className="nutrition-hero__calories" onClick={handleEditCalories}>
              <span className="nutrition-hero__label">{t('nutrition.calories')}</span>
              <strong className="nutrition-hero__value">
                {Math.round(eaten?.calories ?? 0)}
                <em> / {day?.target_calories}</em>
              </strong>
              <span className={`nutrition-hero__progress${caloriesOver ? ' nutrition-hero__progress--over' : ''}`}>
                <i style={{ width: `${caloriesPercent}%` }} />
              </span>
              {delta !== null && (
                <span className="nutrition-hero__badge">
                  {Math.abs(delta) < 25
                    ? t('nutrition.balance')
                    : (
                      <>
                        {delta > 0 ? <FaArrowUp aria-hidden="true" /> : <FaArrowDown aria-hidden="true" />}
                        {t(delta > 0 ? 'nutrition.surplus' : 'nutrition.deficit', { kcal: Math.abs(delta) })}
                      </>
                    )}
                </span>
              )}
            </button>

            <div className="nutrition-hero__macros">
              {macros.map((macro) => (
                <button key={macro.field} type="button" className="macro-pill" onClick={() => handleEditMacro(macro)}>
                  <span className="macro-pill__top">
                    <span className="macro-pill__label">{macro.label}</span>
                    <FaPen className="macro-pill__pen" aria-hidden="true" />
                    <strong>{Math.round(macro.eaten ?? 0)} / {macro.value} {t('nutrition.grams')}</strong>
                  </span>
                  <span className="macro-pill__bar">
                    <i style={{ width: `${macro.value ? Math.min(100, Math.round(((macro.eaten ?? 0) / macro.value) * 100)) : 0}%` }} />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <h3 className="nutrition-subtitle animate-in delay-2">
            {t('food.diary')}
            {entries?.length > 0 && <em>{entries.length}</em>}
          </h3>
          {entries?.length > 0 ? (
            <div className="food-diary animate-in delay-2">
              {entries.map((entry) => (
                <div key={entry.id} className="card food-diary__row">
                  <div className="food-diary__info">
                    <strong>{entry.name}</strong>
                    <span>
                      {entry.grams ? `${Math.round(entry.grams)} ${t('nutrition.grams')} · ` : ''}
                      {t('nutrition.proteinShort')} {Math.round(entry.protein)}
                      {' '}{t('nutrition.fatsShort')} {Math.round(entry.fats)}
                      {' '}{t('nutrition.carbsShort')} {Math.round(entry.carbs)}
                    </span>
                  </div>
                  <span className="food-diary__kcal">{Math.round(entry.calories)} {t('home.kcal')}</span>
                  <button
                    type="button"
                    className="food-diary__remove"
                    onClick={() => handleDeleteEntry(entry.id)}
                    aria-label={t('common.delete')}
                  >
                    <FaXmark />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="card food-diary__empty animate-in delay-2">{t('food.diaryEmpty')}</div>
          )}

          <h3 className="nutrition-subtitle animate-in delay-2">{t('home.goal')}</h3>
          <button type="button" className="card nutrition-tile animate-in delay-2" onClick={handleEditGoal}>
            <span className="nutrition-tile__icon nutrition-tile__icon--goal"><FaBullseye aria-hidden="true" /></span>
            <span className="nutrition-tile__text">
              <strong>{goal.label}</strong>
              <span>{goal.hint}</span>
            </span>
            <FaPen className="nutrition-tile__pen" aria-hidden="true" />
          </button>

          <h3 className="nutrition-subtitle animate-in delay-2">
            {t('nutrition.bmr')}
            {bmr && <em>{Math.round(bmr)} {t('home.kcal')}</em>}
          </h3>
          <button type="button" className="card nutrition-tile animate-in delay-2" onClick={handleEditWeight}>
            <span className="nutrition-tile__icon nutrition-tile__icon--weight"><FaWeightScale aria-hidden="true" /></span>
            <span className="nutrition-tile__text">
              <strong>{userProfile?.weight ? u.fmtWeight(userProfile.weight) : '—'}</strong>
              <span>{t('home.statWeight')}</span>
            </span>
            <FaPen className="nutrition-tile__pen" aria-hidden="true" />
          </button>
          <button type="button" className="card nutrition-tile animate-in delay-2" onClick={handleEditBodyFat}>
            <span className="nutrition-tile__icon nutrition-tile__icon--fat"><FaPercent aria-hidden="true" /></span>
            <span className="nutrition-tile__text">
              <strong>{bodyFat != null ? `${bodyFat} %` : '—'}</strong>
              <span>{t('nutrition.bodyFat')}</span>
            </span>
            <FaPen className="nutrition-tile__pen" aria-hidden="true" />
          </button>

          <h3 className="nutrition-subtitle animate-in delay-3">{t('nutrition.water')}</h3>
          <div className="card nutrition-tile animate-in delay-3">
            <span className="nutrition-tile__icon nutrition-tile__icon--water"><FaGlassWater aria-hidden="true" /></span>
            <span className="nutrition-tile__text">
              <strong>{u.fmtWater(day?.water_liters, day?.target_water_liters)}</strong>
              <span>{t('nutrition.water')}</span>
            </span>
            <span className="water-controls">
              <button
                type="button"
                className="water-controls__btn"
                onClick={() => handleWaterChange(-0.25)}
                disabled={day?.water_liters <= 0}
                aria-label="Убрать 250 мл"
              >
                <FaMinus />
              </button>
              <button
                type="button"
                className="water-controls__btn"
                onClick={() => handleWaterChange(0.25)}
                aria-label="Добавить 250 мл"
              >
                <FaPlus />
              </button>
            </span>
          </div>
        </>
      )}

      <button type="button" className="secondary animate-in delay-3" onClick={showCalculator}>
        {t('nutrition.calculator')}
      </button>

      {/* Камера открывается сразу с кнопки — клик по input идёт из жеста пользователя. */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handlePhotoPicked}
      />

      <FoodFab
        onPhoto={() => photoInputRef.current?.click()}
        onVoice={() => setFoodModal('voice')}
        onBarcode={() => setFoodModal('barcode')}
        onSearch={() => setFoodModal('search')}
      />

      {foodModal === 'photo' && photoFile && (
        <PhotoFoodModal
          file={photoFile}
          onRetake={() => photoInputRef.current?.click()}
          onAdded={setDay}
          onClose={() => { setFoodModal(null); setPhotoFile(null) }}
        />
      )}
      {foodModal === 'voice' && (
        <VoiceFoodModal onAdded={setDay} onClose={() => setFoodModal(null)} />
      )}
      {foodModal === 'barcode' && (
        <BarcodeFoodModal onAdded={setDay} onClose={() => setFoodModal(null)} />
      )}
      {foodModal === 'search' && (
        <SearchFoodModal onAdded={setDay} onClose={() => setFoodModal(null)} />
      )}
    </section>
  )
}

export default NutritionPage
