import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { FaCheck, FaArrowsRotate } from 'react-icons/fa6'
import BackHeader from '../../components/organisms/BackHeader/BackHeader'
import ExercisePickerModal from '../../components/organisms/ExercisePickerModal/ExercisePickerModal'
import { useAppUI } from '../../context/AppUIContext'
import { getWorkout, getExercises } from '../../api/workouts'
import './ExercisePage.scss'

// background=true: плеер без контролов, прогресс-бара и кнопки звука —
// чистый зацикленный ролик без звука, как фоновое видео.
const KINESCOPE_PARAMS = 'background=true&autoplay=true&muted=true&loop=true&playsinline=true&controls=false'

function ExerciseVideo({ ex, hidden }) {
  const cls = `exercise-video__player${hidden ? ' exercise-video__player--preload' : ''}`
  if (ex.video_embed) {
    return (
      <iframe
        className={cls}
        src={`${ex.video_embed}?${KINESCOPE_PARAMS}`}
        title={ex.name}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
      />
    )
  }
  return (
    <video className={cls} src={ex.video_url || ex.videoUrl} autoPlay muted loop playsInline preload="auto">
      <track kind="captions" />
    </video>
  )
}

function ExercisePage() {
  const { programId, index } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { showConfirm, t } = useAppUI()

  const [workout, setWorkout] = useState(location.state?.workout ?? null)
  const [exerciseTemplates, setExerciseTemplates] = useState([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [swappedExercise, setSwappedExercise] = useState(null)

  const sessionId = location.state?.sessionId ?? null
  const elapsed = location.state?.elapsed ?? 0

  const currentIndex = Number(index)

  useEffect(() => {
    if (!workout) {
      getWorkout(programId)
        .then(({ data }) => setWorkout(data))
        .catch(() => navigate('/trainings'))
    }
  }, [programId, workout, navigate])

  useEffect(() => {
    getExercises()
      .then(({ data }) => setExerciseTemplates(data))
      .catch(() => {})
  }, [])

  if (!workout) return null

  const originalExercise = workout.exercises[currentIndex]
  const total = workout.exercises.length
  const progress = ((currentIndex + 1) / total) * 100

  if (!originalExercise) {
    navigate(`/trainings/${programId}/complete`, { replace: true, state: { workout, sessionId, elapsed } })
    return null
  }

  const exercise = swappedExercise?.index === currentIndex ? swappedExercise.exercise : originalExercise
  // Следующее упражнение — его видео предзагружается в скрытом плеере.
  const nextExercise = workout.exercises[currentIndex + 1] ?? null

  const handleSwap = (templateSlug) => {
    const tpl = exerciseTemplates.find((t) => t.slug === templateSlug)
    if (!tpl) return
    setSwappedExercise({
      index: currentIndex,
      exercise: {
        id: tpl.slug,
        name: tpl.name,
        description: tpl.description,
        muscle: tpl.muscle,
        sets: originalExercise.sets,
        reps: originalExercise.reps,
        weight: originalExercise.weight,
        rest: originalExercise.rest,
        video_url: tpl.video_url,
        video_embed: tpl.video_embed,
      },
    })
    setPickerOpen(false)
  }

  const goNext = (wasSkipped = false) => {
    const nextIndex = currentIndex + 1
    const nextState = { workout, sessionId, elapsed }
    if (nextIndex >= total) {
      navigate(`/trainings/${programId}/complete`, { state: nextState })
    } else {
      navigate(`/trainings/${programId}/exercise/${nextIndex}`, { state: nextState })
    }
  }

  const handleDone = () => {
    goNext(false)
  }

  const handleSkip = () => {
    showConfirm(t('workout.skipTitle'), t('workout.skipMessage', { name: exercise.name }), () => goNext(true), t('workout.skip'))
  }

  return (
    <section className="page page-exercise">
      <BackHeader
        title={`${currentIndex + 1} / ${total}`}
        subtitle={workout.title}
        onBack={() =>
          showConfirm(t('workout.exitExerciseTitle'), t('workout.exitExerciseMessage'), () =>
            navigate(`/trainings/${programId}/session`, { state: { workout, sessionId, elapsed } }),
          )
        }
      />

      <div className="exercise-progress animate-in">
        <div className="exercise-progress__bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="exercise-video card animate-in delay-1">
        {/*
          Текущее видео + скрытый предзагруженный плеер следующего упражнения.
          Ключ — id упражнения: при переходе React переиспользует уже
          играющий iframe, и ролик показывается мгновенно, без загрузки.
        */}
        <ExerciseVideo key={exercise.id} ex={exercise} hidden={false} />
        {nextExercise && (nextExercise.video_embed || nextExercise.video_url) && (
          <ExerciseVideo key={nextExercise.id} ex={nextExercise} hidden />
        )}
      </div>

      <button
        type="button"
        className="exercise-info-btn card animate-in delay-2"
        onClick={() => setPickerOpen(true)}
      >
        <div className="exercise-info-btn__text">
          <p className="exercise-muscle">{exercise.muscle}</p>
          <h2>{exercise.name}</h2>
          <p className="exercise-desc">{exercise.description}</p>
        </div>
        <div className="exercise-info-btn__swap">
          <FaArrowsRotate />
          <span>{t('workout.swap')}</span>
        </div>
      </button>

      <div className="exercise-stats card animate-in delay-2">
        <div className="exercise-stats__item">
          <span>{t('workout.sets')}</span>
          <strong>{exercise.sets}</strong>
        </div>
        <div className="exercise-stats__item">
          <span>{t('workout.reps')}</span>
          <strong>{exercise.reps}</strong>
        </div>
        <div className="exercise-stats__item">
          <span>{t('home.statWeight')}</span>
          <strong>{exercise.weight}</strong>
        </div>
        <div className="exercise-stats__item">
          <span>{t('workout.rest')}</span>
          <strong>{exercise.rest}</strong>
        </div>
      </div>

      <div className="exercise-actions animate-in delay-3">
        <button type="button" className="secondary" onClick={handleSkip}>
          {t('workout.skip')}
        </button>
        <button type="button" className="primary exercise-done-btn" onClick={handleDone}>
          <FaCheck aria-hidden="true" />
          {t('workout.done')}
        </button>
      </div>

      {pickerOpen && (
        <ExercisePickerModal
          currentId={exercise.id}
          exercises={exerciseTemplates}
          onSelect={handleSwap}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </section>
  )
}

export default ExercisePage
