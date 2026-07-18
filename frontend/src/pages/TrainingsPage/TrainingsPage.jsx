import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWorkoutCatalog } from '../../api/workouts'
import SectionHead from '../../components/common/SectionHead'
import FeaturedProgramCard from './components/FeaturedProgramCard'
import ProgramFeedCard from './components/ProgramFeedCard'
import TrainingModeTabs from './components/TrainingModeTabs'
import './TrainingsPage.scss'

function TrainingsPage() {
  const [mode, setMode] = useState('gym')
  const [catalog, setCatalog] = useState({ gym: { featured: null, programs: [] }, home: { featured: null, programs: [] } })
  const navigate = useNavigate()

  useEffect(() => {
    getWorkoutCatalog()
      .then(({ data }) => setCatalog(data))
      .catch(() => {})
  }, [])

  const modeData = useMemo(() => catalog[mode] ?? { featured: null, programs: [] }, [catalog, mode])

  const openProgram = (programId) => navigate(`/trainings/${programId}`)

  return (
    <section className="page page-trainings">
      <SectionHead title="Тренировки" />

      <TrainingModeTabs mode={mode} onChange={setMode} />

      {modeData.featured && (
        <FeaturedProgramCard
          data={modeData.featured}
          onOpen={() => openProgram(modeData.featured.id)}
        />
      )}

      <div className="training-program-feed animate-in delay-3">
        {modeData.programs.map((program) => (
          <ProgramFeedCard key={program.id} program={program} onClick={() => openProgram(program.id)} />
        ))}
      </div>
    </section>
  )
}

export default TrainingsPage
