import { useEffect, useState } from 'react'
import { useAppUI } from '../../context/AppUIContext'
import {
  getActivity, getWeightHistory, addWeight,
  getMeasurements, addMeasurement, getProgressPhotos,
} from '../../api/analytics'
import SectionHead from '../../components/common/SectionHead'
import ProgressTabs from './components/ProgressTabs'
import WeightChartCard from './components/WeightChartCard'
import MeasurementsCard from './components/MeasurementsCard'
import PhotoProgressCard from './components/PhotoProgressCard'
import ActivityCard from './components/ActivityCard'
import './StatsPage.scss'

function StatsPage() {
  const [activeTab, setActiveTab] = useState('dynamics')
  const { showInfo, showToast, showModal } = useAppUI()

  const [activity, setActivity] = useState([])
  const [weightHistory, setWeightHistory] = useState([])
  const [measurements, setMeasurements] = useState([])
  const [photos, setPhotos] = useState([])

  useEffect(() => {
    getActivity().then(({ data }) => setActivity(data)).catch(() => {})
    getWeightHistory().then(({ data }) => setWeightHistory(data)).catch(() => {})
    getMeasurements().then(({ data }) => setMeasurements(data ?? [])).catch(() => {})
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

  const handleEditMeasurement = (item) => {
    const currentNumeric = parseFloat(String(item.value).replace(',', '.')) || ''
    showModal({
      title: `Изменить: ${item.label}`,
      message: `Текущее значение: ${item.value}`,
      input: { type: 'number', step: '0.1', defaultValue: currentNumeric, placeholder: 'Новое значение' },
      actions: [
        { label: 'Отмена', variant: 'secondary', onClick: () => {} },
        {
          label: 'Сохранить',
          variant: 'primary',
          onClick: (inputValue) => {
            const val = parseFloat(inputValue || '0')
            const today = new Date().toISOString().slice(0, 10)
            const fieldMap = {
              'Текущий вес': 'weight', 'Процент жира': 'body_fat_percent',
              'Мышечная масса': 'muscle_mass', 'Талия': 'waist_cm',
              'Грудь': 'chest_cm', 'Бедро': 'hip_cm',
            }
            const field = fieldMap[item.label]
            if (!field) return
            if (!(val > 0)) {
              showToast('Введите значение больше нуля')
              return
            }
            addMeasurement({ [field]: val, recorded_at: today })
              .then(() => getMeasurements().then(({ data }) => setMeasurements(data ?? [])))
              .catch(() => showToast('Не удалось сохранить замер'))
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
        <MeasurementsCard
          measurements={measurements}
          onEdit={(item) => handleEditMeasurement(item ?? measurements[0])}
        />
      )}
      {activeTab === 'photo' && (
        <PhotoProgressCard
          photos={photos}
          onPhotoClick={(date) =>
            showInfo(`Фото прогресса · ${date}`, 'Ракурсы: Спереди · Сбоку · Сзади')
          }
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
