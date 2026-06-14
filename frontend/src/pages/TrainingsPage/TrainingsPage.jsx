import { useMemo, useState } from 'react'
import SectionHead from '../../components/common/SectionHead'
import FeaturedProgramCard from './components/FeaturedProgramCard'
import ProgramFeedCard from './components/ProgramFeedCard'
import ProgramTypeChips from './components/ProgramTypeChips'
import TrainingModeTabs from './components/TrainingModeTabs'
import './TrainingsPage.css'

function TrainingsPage({ trainingCatalog, onAction }) {
  const [mode, setMode] = useState('gym')
  const modeData = useMemo(() => trainingCatalog[mode] ?? trainingCatalog.gym, [mode, trainingCatalog])

  return (
    <section className="page page-trainings">
      <SectionHead
        title="Тренировки"
        icon="filter"
        iconMessage="Фильтр"
        onIconClick={() => onAction('Открыт фильтр программ')}
      />

      <TrainingModeTabs
        mode={mode}
        onChange={(nextMode) => {
          setMode(nextMode)
          onAction(`Выбран режим: ${nextMode === 'gym' ? 'Тренировка в зале' : 'Дома'}`)
        }}
      />

      <FeaturedProgramCard data={modeData.featured} onAction={onAction} />

      <ProgramTypeChips categories={modeData.categories} onAction={onAction} />

      <div className="training-program-feed animate-in delay-3">
        {modeData.programs.map((program) => (
          <ProgramFeedCard
            key={program.id}
            program={program}
            onClick={() => onAction(`Открыта программа: ${program.title}`)}
          />
        ))}
      </div>
    </section>
  )
}

export default TrainingsPage
