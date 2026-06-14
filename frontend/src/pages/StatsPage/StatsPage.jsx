import SectionHead from '../../components/common/SectionHead'
import ProgressTabs from './components/ProgressTabs'
import WeightChartCard from './components/WeightChartCard'
import MeasurementsCard from './components/MeasurementsCard'
import PhotoProgressCard from './components/PhotoProgressCard'
import ActivityCard from './components/ActivityCard'
import './StatsPage.css'

function StatsPage({
  activeTab,
  onChangeTab,
  weightHistory,
  measurements,
  photos,
  activity,
  onAction,
}) {
  return (
    <section className="page page-stats">
      <SectionHead
        title="Аналитика"
        icon="analytics"
        iconMessage="Экспорт"
        onIconClick={() => onAction('Открыт экспорт статистики')}
      />

      <ProgressTabs activeTab={activeTab} onChange={onChangeTab} />

      {activeTab === 'dynamics' && <WeightChartCard points={weightHistory} />}
      {activeTab === 'measurements' && <MeasurementsCard measurements={measurements} onAction={onAction} />}
      {activeTab === 'photo' && <PhotoProgressCard photos={photos} onAction={onAction} />}

      <ActivityCard items={activity} onAction={onAction} />
    </section>
  )
}

export default StatsPage
