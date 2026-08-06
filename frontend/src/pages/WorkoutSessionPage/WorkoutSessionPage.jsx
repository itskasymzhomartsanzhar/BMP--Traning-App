import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { FaPlay, FaPause, FaArrowRight } from 'react-icons/fa6'
import BackHeader from '../../components/organisms/BackHeader/BackHeader'
import { useAppUI } from '../../context/AppUIContext'
import { getWorkout, createSession, updateSession } from '../../api/workouts'
import './WorkoutSessionPage.scss'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function WorkoutSessionPage() {
  const { programId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { showConfirm, t } = useAppUI()

  const [workout, setWorkout] = useState(location.state?.workout ?? null)
  const [sessionId, setSessionId] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const elapsedRef = useRef(0)

  useEffect(() => {
    if (!workout) {
      getWorkout(programId)
        .then(({ data }) => setWorkout(data))
        .catch(() => navigate('/trainings'))
    }
  }, [programId, workout, navigate])

  useEffect(() => {
    if (!workout) return
    createSession(programId, new Date().toISOString())
      .then(({ data }) => setSessionId(data.id))
      .catch(() => {})
  }, [workout, programId])

  useEffect(() => {
    if (!running) return undefined
    const id = window.setInterval(() => {
      setElapsed((v) => {
        elapsedRef.current = v + 1
        return v + 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [running])

  useEffect(() => {
    if (!sessionId) return undefined
    const id = window.setInterval(() => {
      if (elapsedRef.current > 0) {
        updateSession(sessionId, { elapsed_seconds: elapsedRef.current }).catch(() => {})
      }
    }, 30000)
    return () => window.clearInterval(id)
  }, [sessionId])

  const handleBack = () => {
    showConfirm(
      t('workout.exitTitle'),
      t('workout.exitMessage'),
      () => {
        if (sessionId) updateSession(sessionId, { status: 'abandoned' }).catch(() => {})
        navigate(`/trainings/${programId}`)
      },
      t('workout.exitAction'),
    )
  }

  if (!workout) {
    return (
      <section className="page page-workout-session">
        <BackHeader title={t('common.loading')} onBack={() => navigate('/trainings')} />
      </section>
    )
  }

  return (
    <section className="page page-workout-session">
      <BackHeader
        title={t('workout.title')}
        subtitle={workout.title}
        onBack={handleBack}
      />

      <div className="session-timer card animate-in delay-1">
        <p className="session-timer__label">{t('workout.sessionTime')}</p>
        <p className="session-timer__value">{formatTime(elapsed)}</p>
        <button
          type="button"
          className={`session-timer__toggle ${running ? 'secondary' : 'primary'}`}
          onClick={() => setRunning((v) => !v)}
        >
          {running ? <><FaPause /> {t('workout.pause')}</> : <><FaPlay /> {t('workout.startTimer')}</>}
        </button>
      </div>

      <div className="card animate-in delay-2">
        <h2>{t('workout.plan')} · {workout.exercises.length}</h2>
        <ul className="session-exercises">
          {workout.exercises.map((ex, i) => (
            <li
              key={ex.id + i}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/trainings/${programId}/exercise/${i}`, { state: { workout, sessionId, elapsed } })}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/trainings/${programId}/exercise/${i}`, { state: { workout, sessionId, elapsed } })}
            >
              <span className="session-ex-num">{i + 1}</span>
              <div className="session-ex-info">
                <strong>{ex.name}</strong>
                <p>{ex.sets} × {ex.reps}{ex.weight !== '—' ? ` · ${ex.weight}` : ''}</p>
              </div>
              <FaArrowRight className="session-ex-arrow" />
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        className="primary session-start-btn animate-in delay-3"
        onClick={() => navigate(`/trainings/${programId}/exercise/0`, { state: { workout, sessionId, elapsed } })}
      >
        <FaPlay aria-hidden="true" />
        {t('workout.startFirst')}
      </button>
    </section>
  )
}

export default WorkoutSessionPage
