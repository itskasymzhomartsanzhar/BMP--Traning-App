import { useEffect, useState } from 'react'
import { useAppUI } from '../../context/AppUIContext'
import {
  getActivity, getWeightHistory, addWeight,
  getMeasurements, getProgressPhotos,
} from '../../api/analytics'
import SectionHead from '../../components/common/SectionHead'
import ProgressTabs from './components/ProgressTabs'
import WeightChartCard from './components/WeightChartCard'
import MeasurementsCard from './components/MeasurementsCard'
import MeasurementModal from './components/MeasurementModal'
import PhotoProgressCard from './components/PhotoProgressCard'
import PhotoCaptureModal from './components/PhotoCaptureModal'
import ActivityCard from './components/ActivityCard'
import './StatsPage.scss'

function StatsPage() {
  const [activeTab, setActiveTab] = useState('dynamics')
  const { showInfo, showToast, showModal, userProfile, updateUserProfile, t } = useAppUI()

  const [activity, setActivity] = useState([])
  const [weightHistory, setWeightHistory] = useState([])
  const [measurements, setMeasurements] = useState([])
  const [photos, setPhotos] = useState([])
  const [captureOpen, setCaptureOpen] = useState(false)
  const [measureOpen, setMeasureOpen] = useState(false)

  useEffect(() => {
    getActivity().then(({ data }) => setActivity(data)).catch(() => {})
    getWeightHistory().then(({ data }) => setWeightHistory(data)).catch(() => {})
    // Без замеров бэкенд отвечает пустым телом — axios отдаёт '', а не null.
    getMeasurements().then(({ data }) => setMeasurements(Array.isArray(data) ? data : [])).catch(() => {})
    getProgressPhotos().then(({ data }) => setPhotos(data)).catch(() => {})
  }, [])

  const handleAddWeight = () => {
    showModal({
      title: t('stats.addWeightTitle'),
      message: t('stats.addWeightMessage'),
      input: { type: 'number', step: '0.1', placeholder: t('stats.addWeightPlaceholder') },
      actions: [
        { label: t('common.cancel'), variant: 'secondary', onClick: () => {} },
        {
          label: t('common.save'),
          variant: 'primary',
          onClick: (inputValue) => {
            const val = parseFloat(inputValue || '0')
            if (!(val > 0)) {
              showToast(t('stats.weightError'))
              return
            }
            const today = new Date().toISOString().slice(0, 10)
            addWeight(val, today)
              .then(() => getWeightHistory().then(({ data }) => setWeightHistory(data)))
              .catch(() => showToast(t('stats.weightSaveError')))
          },
        },
      ],
    })
  }

  const handleEditHeight = () => {
    showModal({
      title: t('stats.editHeightTitle'),
      message: userProfile?.height ? t('stats.heightCurrent', { height: userProfile.height }) : t('stats.heightEmpty'),
      input: { type: 'number', step: '1', defaultValue: userProfile?.height ?? '', placeholder: t('stats.heightPlaceholder') },
      actions: [
        { label: t('common.cancel'), variant: 'secondary', onClick: () => {} },
        {
          label: t('common.save'),
          variant: 'primary',
          onClick: (inputValue) => {
            const height = Math.round(Number(String(inputValue).replace(',', '.')))
            if (!Number.isFinite(height) || height < 80 || height > 250) {
              showToast(t('stats.heightError'))
              return
            }
            updateUserProfile({ height })
          },
        },
      ],
    })
  }

  return (
    <section className="page page-stats">
      <SectionHead title={t('stats.title')} />

      <ProgressTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'dynamics' && (
        <>
          <WeightChartCard points={weightHistory} />
          <button type="button" className="secondary animate-in delay-3" onClick={handleAddWeight}>
            {t('stats.addWeight')}
          </button>
        </>
      )}
      {activeTab === 'measurements' && (
        <>
          <MeasurementsCard measurements={measurements} onEdit={() => setMeasureOpen(true)} />
          <button type="button" className="secondary animate-in delay-3" onClick={handleEditHeight}>
            {t('stats.editHeight')}{userProfile?.height ? ` · ${t('stats.heightNow', { height: userProfile.height })}` : ''}
          </button>
        </>
      )}
      {activeTab === 'photo' && (
        <PhotoProgressCard photos={photos} onAdd={() => setCaptureOpen(true)} />
      )}

      {captureOpen && (
        <PhotoCaptureModal
          onClose={() => setCaptureOpen(false)}
          onUploaded={(photo) => setPhotos((prev) => [...prev, photo])}
        />
      )}

      {measureOpen && (
        <MeasurementModal
          current={measurements}
          onClose={() => setMeasureOpen(false)}
          onSaved={(data) => setMeasurements(Array.isArray(data) ? data : [])}
        />
      )}

      <ActivityCard
        items={activity}
        onDayClick={(item) =>
          showInfo(`${item.day}: активность`, `${item.value} тренировок за день.`)
        }
      />
    </section>
  )
}

export default StatsPage
