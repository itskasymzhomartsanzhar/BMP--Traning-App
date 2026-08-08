import { useEffect, useRef, useState } from 'react'
import { FaBarcode } from 'react-icons/fa6'
import Modal from '../../../components/organisms/Modal/Modal'
import { useAppUI } from '../../../context/AppUIContext'
import { lookupBarcode, addFoodEntries } from '../../../api/nutrition'
import { portionFromPer100, apiErrorText } from './foodUtils'

const today = () => new Date().toISOString().slice(0, 10)

function BarcodeFoodModal({ onAdded, onClose }) {
  const { showToast, t } = useAppUI()
  const [phase, setPhase] = useState('scan') // scan | lookup | product
  const [cameraError, setCameraError] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [product, setProduct] = useState(null)
  const [grams, setGrams] = useState('100')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const videoRef = useRef(null)
  const cleanupRef = useRef(null)
  const foundRef = useRef(false)

  const stopCamera = () => {
    cleanupRef.current?.()
    cleanupRef.current = null
  }

  const handleCode = (code) => {
    if (foundRef.current) return
    foundRef.current = true
    stopCamera()
    setPhase('lookup')
    setError(null)
    lookupBarcode(code)
      .then(({ data }) => {
        setProduct(data)
        setGrams('100')
        setPhase('product')
      })
      .catch((err) => {
        setError(apiErrorText(err, t('food.notFound')))
        foundRef.current = false
        setPhase('scan')
        setCameraError(true) // камеру не перезапускаем — код можно ввести руками
      })
  }

  // Скан с камеры: нативный BarcodeDetector, иначе @zxing/browser (iOS).
  useEffect(() => {
    if (phase !== 'scan' || cameraError) return undefined
    let disposed = false

    const start = async () => {
      try {
        if ('BarcodeDetector' in window) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
          if (disposed) {
            stream.getTracks().forEach((track) => track.stop())
            return
          }
          const video = videoRef.current
          video.srcObject = stream
          await video.play()
          const detector = new window.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'],
          })
          const interval = setInterval(() => {
            detector.detect(video)
              .then((codes) => { if (codes[0]?.rawValue) handleCode(codes[0].rawValue) })
              .catch(() => {})
          }, 350)
          cleanupRef.current = () => {
            clearInterval(interval)
            stream.getTracks().forEach((track) => track.stop())
          }
        } else {
          const { BrowserMultiFormatReader } = await import('@zxing/browser')
          const reader = new BrowserMultiFormatReader()
          const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
            if (result) handleCode(result.getText())
          })
          if (disposed) {
            controls.stop()
            return
          }
          cleanupRef.current = () => controls.stop()
        }
      } catch {
        if (!disposed) setCameraError(true)
      }
    }

    start()
    return () => {
      disposed = true
      stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, cameraError])

  const handleManual = () => {
    const code = manualCode.replace(/\D/g, '')
    if (code.length < 6) {
      setError(t('food.badCode'))
      return
    }
    handleCode(code)
  }

  const gramsNumber = Number(String(grams).replace(',', '.'))
  const portion = product && Number.isFinite(gramsNumber) && gramsNumber > 0
    ? portionFromPer100(product.per100, gramsNumber)
    : null

  const handleConfirm = () => {
    if (!portion) return
    setSaving(true)
    const name = product.brand ? `${product.name} · ${product.brand}` : product.name
    addFoodEntries(today(), [{ name, ...portion }], 'barcode')
      .then(({ data }) => {
        onAdded(data)
        showToast(t('food.added'))
        onClose()
      })
      .catch((err) => showToast(apiErrorText(err, t('food.addError'))))
      .finally(() => setSaving(false))
  }

  return (
    <Modal title={t('food.barcodeTitle')} onClose={onClose} className="food-modal">
      {phase === 'scan' && (
        <>
          {!cameraError ? (
            <div className="food-scan">
              <video ref={videoRef} className="food-scan__video" muted playsInline />
              <span className="food-scan__frame" aria-hidden="true" />
              <p className="food-scan__hint">{t('food.scanHint')}</p>
            </div>
          ) : (
            <p className="food-modal__note">{t('food.cameraError')}</p>
          )}
          {error && <p className="food-modal__error">{error}</p>}
          <p className="food-modal__or">{t('food.manualCode')}</p>
          <div className="food-scan__manual">
            <input
              type="text"
              inputMode="numeric"
              placeholder="4600682406129"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
            />
            <button type="button" className="primary" disabled={manualCode.replace(/\D/g, '').length < 6} onClick={handleManual}>
              {t('food.find')}
            </button>
          </div>
        </>
      )}

      {phase === 'lookup' && (
        <div className="food-modal__status">
          <span className="food-modal__spinner" aria-hidden="true" />
          {t('common.loading')}
        </div>
      )}

      {phase === 'product' && product && (
        <>
          <div className="food-product">
            <span className="food-product__icon"><FaBarcode aria-hidden="true" /></span>
            <div className="food-product__info">
              <strong>{product.name}</strong>
              {product.brand ? <span>{product.brand}</span> : null}
              <span>
                {Math.round(product.per100.calories)} {t('home.kcal')}
                {' · '}{t('nutrition.proteinShort')} {Math.round(product.per100.protein || 0)}
                {' '}{t('nutrition.fatsShort')} {Math.round(product.per100.fats || 0)}
                {' '}{t('nutrition.carbsShort')} {Math.round(product.per100.carbs || 0)}
                {' '}{t('food.per100')}
              </span>
            </div>
          </div>

          <label className="food-portion">
            <span>{t('food.portion')}</span>
            <input
              type="number"
              inputMode="decimal"
              min="1"
              max="5000"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
            />
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
            <button
              type="button"
              className="secondary"
              onClick={() => {
                foundRef.current = false
                setProduct(null)
                setError(null)
                setPhase('scan')
              }}
            >
              {t('food.scanAgain')}
            </button>
            <button type="button" className="primary" disabled={!portion || saving} onClick={handleConfirm}>
              {saving ? t('common.loading') : t('food.add')}
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}

export default BarcodeFoodModal
