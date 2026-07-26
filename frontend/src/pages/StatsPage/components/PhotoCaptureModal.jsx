import { useEffect, useRef, useState } from 'react'
import { FaXmark, FaCamera, FaImage, FaRotateLeft, FaCheck } from 'react-icons/fa6'
import { uploadProgressPhoto } from '../../../api/analytics'
import './PhotoCaptureModal.scss'

/**
 * Сетка-направляющие: макушка к верхней линии, стопы к нижней.
 * Одни и те же отметки в видоискателе и на превью — кадры из разных дней
 * получаются с одинаковым расстоянием до камеры, и прогресс сравним.
 */
function AlignmentGrid() {
  return (
    <div className="pcap-grid" aria-hidden="true">
      <div className="pcap-grid__line pcap-grid__line--head">
        <span>Макушка</span>
      </div>
      <div className="pcap-grid__line pcap-grid__line--feet">
        <span>Стопы</span>
      </div>
      <div className="pcap-grid__vertical" />
      <div className="pcap-grid__thirds pcap-grid__thirds--left" />
      <div className="pcap-grid__thirds pcap-grid__thirds--right" />
    </div>
  )
}

function PhotoCaptureModal({ onClose, onUploaded }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)

  // camera | preview | no-camera
  const [phase, setPhase] = useState('no-camera')
  const [previewUrl, setPreviewUrl] = useState(null)
  const [blob, setBlob] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    if (!navigator.mediaDevices?.getUserMedia) return undefined

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1080 }, height: { ideal: 1920 } } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        setPhase('camera')
      })
      .catch(() => {
        // Нет камеры или нет разрешения — остаёмся в режиме выбора из галереи.
      })

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  // Стрим подключается к <video> после того, как элемент отрендерен.
  useEffect(() => {
    if (phase === 'camera' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [phase])

  const takeShot = () => {
    const video = videoRef.current
    if (!video?.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob(
      (shot) => {
        if (!shot) return
        setBlob(shot)
        setPreviewUrl(URL.createObjectURL(shot))
        setPhase('preview')
      },
      'image/jpeg',
      0.92,
    )
  }

  const pickFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setBlob(file)
    setPreviewUrl(URL.createObjectURL(file))
    setPhase('preview')
    event.target.value = ''
  }

  const retake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setBlob(null)
    setError('')
    setPhase(streamRef.current ? 'camera' : 'no-camera')
  }

  const save = () => {
    if (!blob || saving) return
    setSaving(true)
    setError('')
    const file = blob instanceof File ? blob : new File([blob], 'progress.jpg', { type: 'image/jpeg' })
    uploadProgressPhoto(file)
      .then(({ data }) => {
        onUploaded?.(data)
        onClose()
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Не удалось загрузить фото. Попробуйте ещё раз.')
        setSaving(false)
      })
  }

  return (
    <div className="pcap-overlay" role="presentation" onClick={onClose}>
      <div className="pcap-sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="pcap-head">
          <h2>Фото прогресса</h2>
          <button type="button" className="pcap-close" onClick={onClose} aria-label="Закрыть">
            <FaXmark />
          </button>
        </div>

        <p className="pcap-hint">
          Встаньте так, чтобы макушка была у верхней линии, а стопы — у нижней.
          Тогда снимки разных дней будут в одном масштабе.
        </p>

        <div className="pcap-frame">
          {phase === 'camera' && (
            <video ref={videoRef} className="pcap-media" autoPlay playsInline muted />
          )}
          {phase === 'preview' && (
            <img className="pcap-media" src={previewUrl} alt="Проверьте кадр по сетке" />
          )}
          {phase === 'no-camera' && (
            <div className="pcap-placeholder">
              <FaImage aria-hidden="true" />
              <p>Камера недоступна — выберите фото из галереи и сверьте его с сеткой.</p>
            </div>
          )}
          <AlignmentGrid />
        </div>

        {error && <p className="pcap-error">{error}</p>}

        <div className="pcap-actions">
          {phase === 'camera' && (
            <>
              <button type="button" className="secondary" onClick={() => fileInputRef.current?.click()}>
                <FaImage aria-hidden="true" /> Галерея
              </button>
              <button type="button" className="primary" onClick={takeShot}>
                <FaCamera aria-hidden="true" /> Снимок
              </button>
            </>
          )}

          {phase === 'no-camera' && (
            <button type="button" className="primary" onClick={() => fileInputRef.current?.click()}>
              <FaImage aria-hidden="true" /> Выбрать фото
            </button>
          )}

          {phase === 'preview' && (
            <>
              <button type="button" className="secondary" onClick={retake} disabled={saving}>
                <FaRotateLeft aria-hidden="true" /> Переснять
              </button>
              <button type="button" className="primary" onClick={save} disabled={saving}>
                <FaCheck aria-hidden="true" /> {saving ? 'Сохраняем…' : 'Сохранить'}
              </button>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="pcap-file"
          onChange={pickFile}
        />
      </div>
    </div>
  )
}

export default PhotoCaptureModal
