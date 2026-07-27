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
  const { showInfo, showToast, showModal } = useAppUI()

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
      title: 'Добавить замер веса',
      message: 'Введите текущий вес (кг):',
      input: { type: 'number', step: '0.1', placeholder: 'Например, 72.5' },
      actions: [
        { label: 'Отмена', variant: 'secondary', onClick: () => {} },
        {
          label: 'Сохранить',
          variant: 'primary',
          onClick: (inputValue) => {
            const val = parseFloat(inputValue || '0')
            if (!(val > 0)) {
              showToast('Введите вес больше нуля')
              return
            }
            const today = new Date().toISOString().slice(0, 10)
            addWeight(val, today)
              .then(() => getWeightHistory().then(({ data }) => setWeightHistory(data)))
              .catch(() => showToast('Не удалось сохранить вес'))
          },
        },
      ],
    })
  }

  return (
    <section className="page page-stats">
      <SectionHead title="Аналитика" />

      <ProgressTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'dynamics' && (
        <>
          <WeightChartCard points={weightHistory} />
          <button type="button" className="secondary animate-in delay-3" onClick={handleAddWeight}>
            + Добавить замер веса
          </button>
        </>
      )}
      {activeTab === 'measurements' && (
        <MeasurementsCard measurements={measurements} onEdit={() => setMeasureOpen(true)} />
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
