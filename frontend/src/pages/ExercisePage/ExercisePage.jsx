import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { FaCheck, FaArrowsRotate } from 'react-icons/fa6'
import BackHeader from '../../components/organisms/BackHeader/BackHeader'
import ExercisePickerModal from '../../components/organisms/ExercisePickerModal/ExercisePickerModal'
import { useAppUI } from '../../context/AppUIContext'
import { getWorkout, getExercises } from '../../api/workouts'
import './ExercisePage.scss'

function ExercisePage() {
  const { programId, index } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { showConfirm } = useAppUI()

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
    showConfirm('Пропустить упражнение?', `${exercise.name} будет отмечено как пропущенное.`, () => goNext(true), 'Пропустить')
  }

  return (
    <section className="page page-exercise">
      <BackHeader
        title={`${currentIndex + 1} / ${total}`}
        subtitle={workout.title}
        onBack={() =>
          showConfirm('Выйти из упражнения?', 'Вернуться к плану тренировки?', () =>
            navigate(`/trainings/${programId}/session`, { state: { workout, sessionId, elapsed } }),
          )
        }
      />

      <div className="exercise-progress animate-in">
        <div className="exercise-progress__bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="exercise-video card animate-in delay-1">
        {exercise.video_embed ? (
          // Kinescope: автозапуск без звука, по кругу. key — чтобы плеер
          // пересоздавался при смене упражнения, а не продолжал старый ролик.
          <iframe
            key={exercise.id}
            className="exercise-video__player"
            src={`${exercise.video_embed}?autoplay=true&muted=true&loop=true&playsinline=true`}
            title={exercise.name}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
          />
        ) : (
          <video
            key={exercise.id}
            className="exercise-video__player"
            src={exercise.video_url || exercise.videoUrl}
            autoPlay
            muted
            loop
            controls
            playsInline
            poster=""
          >
            <track kind="captions" />
          </video>
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
          <span>Заменить</span>
        </div>
      </button>

      <div className="exercise-stats card animate-in delay-2">
        <div className="exercise-stats__item">
          <span>Подходы</span>
          <strong>{exercise.sets}</strong>
        </div>
        <div className="exercise-stats__item">
          <span>Повторения</span>
          <strong>{exercise.reps}</strong>
        </div>
        <div className="exercise-stats__item">
          <span>Вес</span>
          <strong>{exercise.weight}</strong>
        </div>
        <div className="exercise-stats__item">
          <span>Отдых</span>
          <strong>{exercise.rest}</strong>
        </div>
      </div>

      <div className="exercise-actions animate-in delay-3">
        <button type="button" className="secondary" onClick={handleSkip}>
          Пропустить
        </button>
        <button type="button" className="primary exercise-done-btn" onClick={handleDone}>
          <FaCheck aria-hidden="true" />
          Выполнено
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
