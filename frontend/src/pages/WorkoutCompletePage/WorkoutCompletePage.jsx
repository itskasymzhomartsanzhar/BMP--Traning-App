import { useEffect, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { FaTrophy, FaFire, FaClock, FaDumbbell } from 'react-icons/fa6'
import { useAppUI } from '../../context/AppUIContext'
import { completeSession } from '../../api/workouts'
import './WorkoutCompletePage.scss'

function WorkoutCompletePage() {
  const { t } = useAppUI()
  const { programId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const completedRef = useRef(false)

  const workout = location.state?.workout
  const sessionId = location.state?.sessionId
  const elapsed = location.state?.elapsed ?? 0

  useEffect(() => {
    if (!sessionId || completedRef.current) return
    completedRef.current = true
    completeSession(sessionId, {
      ended_at: new Date().toISOString(),
      elapsed_seconds: elapsed,
    }).catch(() => {})
  }, [sessionId, elapsed])

  if (!workout) {
    return (
      <section className="page page-workout-complete">
        <div className="complete-hero card animate-in">
          <div className="complete-hero__icon"><FaTrophy /></div>
          <h1>{t('workout.completedTitle')}</h1>
        </div>
        <button type="button" className="primary animate-in" onClick={() => navigate('/')}>
          {t('workout.toHome')}
        </button>
      </section>
    )
  }

  return (
    <section className="page page-workout-complete">
      <div className="complete-hero card animate-in">
        <div className="complete-hero__icon">
          <FaTrophy />
        </div>
        <h1>{t('workout.doneTitle')}</h1>
        <p>
          {t('workout.completedProgram', { title: workout.title })}<br />
          {t('workout.greatJob', { count: workout.exercises.length })}
        </p>
      </div>

      <div className="complete-stats card animate-in delay-1">
        <div className="complete-stats__item">
          <FaClock className="complete-stats__icon" />
          <span>{t('workout.duration')}</span>
          <strong>{workout.duration}</strong>
        </div>
        <div className="complete-stats__item">
          <FaFire className="complete-stats__icon" />
          <span>{t('nutrition.calories')}</span>
          <strong>{workout.calories}</strong>
        </div>
        <div className="complete-stats__item">
          <FaDumbbell className="complete-stats__icon" />
          <span>{t('workout.exercises')}</span>
          <strong>{workout.exercises.length}</strong>
        </div>
      </div>

      <button
        type="button"
        className="primary animate-in delay-2"
        onClick={() => navigate('/')}
      >
        {t('workout.toHome')}
      </button>
      <button
        type="button"
        className="secondary animate-in delay-3"
        onClick={() => navigate('/trainings')}
      >
        {t('workout.moreWorkouts')}
      </button>
    </section>
  )
}

export default WorkoutCompletePage
