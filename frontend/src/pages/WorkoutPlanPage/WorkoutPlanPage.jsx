import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FaClock, FaFireFlameSimple, FaDumbbell } from 'react-icons/fa6'
import BackHeader from '../../components/organisms/BackHeader/BackHeader'
import { useAppUI } from '../../context/AppUIContext'
import { getWorkout } from '../../api/workouts'
import './WorkoutPlanPage.scss'

function WorkoutPlanPage() {
  const { t } = useAppUI()
  const { programId } = useParams()
  const navigate = useNavigate()
  const [workout, setWorkout] = useState(null)

  useEffect(() => {
    getWorkout(programId)
      .then(({ data }) => setWorkout(data))
      .catch(() => navigate('/trainings'))
  }, [programId, navigate])

  if (!workout) {
    return (
      <section className="page page-workout-plan">
        <BackHeader title={t('common.loading')} onBack={() => navigate('/trainings')} />
      </section>
    )
  }

  return (
    <section className="page page-workout-plan">
      <BackHeader
        title={workout.title}
        subtitle={workout.description}
        onBack={() => navigate('/trainings')}
      />

      <div className="workout-meta card animate-in delay-1">
        <div className="workout-meta__item">
          <FaClock aria-hidden="true" />
          <span>{workout.duration}</span>
        </div>
        <div className="workout-meta__item">
          <FaFireFlameSimple aria-hidden="true" />
          <span>{workout.calories}</span>
        </div>
        <div className="workout-meta__item">
          <FaDumbbell aria-hidden="true" />
          <span>{workout.intensity}</span>
        </div>
      </div>

      <div className="card animate-in delay-2">
        <h2>{t('workout.exercises')} · {workout.exercises.length}</h2>
        <ul className="exercise-list">
          {workout.exercises.map((ex, i) => (
            <li key={ex.id + i} className="exercise-list__item">
              <span className="exercise-list__num">{i + 1}</span>
              <div>
                <strong>{ex.name}</strong>
                <p>
                  {ex.sets} × {ex.reps}
                  {ex.weight !== '—' ? ` · ${ex.weight}` : ''}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        className="primary animate-in delay-3"
        onClick={() => navigate(`/trainings/${programId}/session`, { state: { workout } })}
      >
        {t('home.startWorkout')}
      </button>
    </section>
  )
}

export default WorkoutPlanPage
