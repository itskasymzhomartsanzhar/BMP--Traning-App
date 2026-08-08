import { useEffect, useRef, useState } from 'react'
import { FaMicrophone, FaStop } from 'react-icons/fa6'
import Modal from '../../../components/organisms/Modal/Modal'
import { useAppUI } from '../../../context/AppUIContext'
import { analyzeFoodVoice, addFoodEntries } from '../../../api/nutrition'
import FoodItemsPreview from './FoodItemsPreview'
import { apiErrorText } from './foodUtils'

const today = () => new Date().toISOString().slice(0, 10)
const MAX_SECONDS = 60

// Формат записи: Safari (iOS/Mini App) пишет mp4, остальные — webm/opus.
function pickMime() {
  if (typeof MediaRecorder === 'undefined') return null
  const options = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
  return options.find((mime) => MediaRecorder.isTypeSupported(mime)) || ''
}

function VoiceFoodModal({ onAdded, onClose }) {
  const { showToast, t } = useAppUI()
  const [phase, setPhase] = useState('idle') // idle | recording | analyzing | result
  const [seconds, setSeconds] = useState(0)
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const discardRef = useRef(false)

  const stopStream = () => {
    clearInterval(timerRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  useEffect(() => () => {
    discardRef.current = true
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
    stopStream()
  }, [])

  const analyze = (payload) => {
    setPhase('analyzing')
    setError(null)
    analyzeFoodVoice(payload)
      .then(({ data }) => {
        setResult(data)
        setPhase('result')
      })
      .catch((err) => {
        setError(apiErrorText(err, t('food.aiError')))
        setPhase('idle')
      })
  }

  const startRecording = async () => {
    const mime = pickMime()
    if (mime === null || !navigator.mediaDevices?.getUserMedia) {
      setError(t('food.micError'))
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      discardRef.current = false
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      recorderRef.current = recorder
      recorder.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data) }
      recorder.onstop = () => {
        stopStream()
        if (discardRef.current) return
        const type = recorder.mimeType || 'audio/webm'
        const ext = type.includes('mp4') ? 'm4a' : 'webm'
        const blob = new File([new Blob(chunksRef.current, { type })], `voice.${ext}`, { type })
        if (blob.size < 1000) {
          setError(t('food.tooShort'))
          setPhase('idle')
          return
        }
        analyze({ audio: blob })
      }
      recorder.start()
      setSeconds(0)
      setError(null)
      setPhase('recording')
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev + 1 >= MAX_SECONDS && recorderRef.current?.state === 'recording') recorderRef.current.stop()
          return prev + 1
        })
      }, 1000)
    } catch {
      setError(t('food.micError'))
    }
  }

  const stopRecording = () => {
    clearInterval(timerRef.current)
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }

  const handleConfirm = (items) => {
    setSaving(true)
    addFoodEntries(today(), items, 'voice')
      .then(({ data }) => {
        onAdded(data)
        showToast(t('food.added'))
        onClose()
      })
      .catch((err) => showToast(apiErrorText(err, t('food.addError'))))
      .finally(() => setSaving(false))
  }

  const restart = () => {
    setResult(null)
    setError(null)
    setPhase('idle')
  }

  const emptyResult = result && result.items.length === 0

  return (
    <Modal title={t('food.voiceTitle')} onClose={onClose} className="food-modal">
      {phase === 'idle' && (
        <>
          <p className="food-modal__note">{t('food.voiceHint')}</p>
          {error && <p className="food-modal__error">{error}</p>}
          <button type="button" className="food-voice__record" onClick={startRecording}>
            <FaMicrophone aria-hidden="true" />
            {t('food.startRec')}
          </button>
          <p className="food-modal__or">{t('food.orText')}</p>
          <textarea
            className="food-modal__textarea"
            rows="2"
            placeholder={t('food.textPlaceholder')}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="modal__actions">
            <button type="button" className="secondary" onClick={onClose}>{t('common.cancel')}</button>
            <button type="button" className="primary" disabled={!text.trim()} onClick={() => analyze({ text: text.trim() })}>
              {t('food.recognize')}
            </button>
          </div>
        </>
      )}

      {phase === 'recording' && (
        <>
          <div className="food-voice__live">
            <span className="food-voice__pulse" aria-hidden="true"><FaMicrophone /></span>
            <strong>{String(Math.floor(seconds / 60))}:{String(seconds % 60).padStart(2, '0')}</strong>
            <span className="food-voice__hint">{t('food.recHint')}</span>
          </div>
          <div className="modal__actions">
            <button
              type="button"
              className="secondary"
              onClick={() => {
                discardRef.current = true
                stopRecording()
                setPhase('idle')
              }}
            >
              {t('common.cancel')}
            </button>
            <button type="button" className="primary" onClick={stopRecording}>
              <FaStop aria-hidden="true" /> {t('food.stopRec')}
            </button>
          </div>
        </>
      )}

      {phase === 'analyzing' && (
        <div className="food-modal__status">
          <span className="food-modal__spinner" aria-hidden="true" />
          {t('food.analyzing')}
        </div>
      )}

      {phase === 'result' && result && (
        <>
          {result.transcript ? <p className="food-modal__quote">«{result.transcript}»</p> : null}
          {emptyResult ? (
            <>
              <p className="food-modal__error">{result.comment || t('food.nothing')}</p>
              <div className="modal__actions">
                <button type="button" className="secondary" onClick={onClose}>{t('common.cancel')}</button>
                <button type="button" className="primary" onClick={restart}>{t('food.rerecord')}</button>
              </div>
            </>
          ) : (
            <FoodItemsPreview
              key={result.transcript}
              items={result.items}
              onConfirm={handleConfirm}
              onRetry={restart}
              retryLabel={t('food.rerecord')}
              busy={saving}
            />
          )}
        </>
      )}
    </Modal>
  )
}

export default VoiceFoodModal
