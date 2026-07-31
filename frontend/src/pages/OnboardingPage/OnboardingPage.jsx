import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAppUI } from '../../context/AppUIContext'
import { submitOnboarding } from '../../api/users'
import OnboardingWizard from './OnboardingWizard'
import OnboardingResult from './OnboardingResult'

function OnboardingPage() {
  const navigate = useNavigate()
  const { userProfile, isOnboarded, completeOnboarding } = useAppUI()
  const [result, setResult] = useState(null)
  const [userName, setUserName] = useState('')

  // Анкету проходят один раз; result важнее — иначе экран плана
  // пропадёт сразу после сохранения.
  if (!result && isOnboarded) {
    return <Navigate to="/" replace />
  }

  if (result) {
    return (
      <OnboardingResult
        recommendation={result}
        userName={userName}
        onStart={() => navigate(`/trainings/${result.program_id}`, { replace: true })}
        onSkip={() => navigate('/', { replace: true })}
      />
    )
  }

  return (
    <OnboardingWizard
      initialName={userProfile?.first_name || userProfile?.display_name || ''}
      onSubmit={(payload, form) =>
        submitOnboarding(payload).then(({ data }) => {
          completeOnboarding(data.user)
          // «Своя программа» — без экрана плана, сразу в приложение.
          if (payload.level === 'custom') {
            navigate('/', { replace: true })
            return
          }
          setUserName(form.name.trim())
          setResult(data.recommendation)
        })
      }
    />
  )
}

export default OnboardingPage
