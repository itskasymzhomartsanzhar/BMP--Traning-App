import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppUIProvider } from './context/AppUIContext'
import AuthGate from './components/common/AuthGate'
import MainLayout from './layouts/MainLayout'
import FlowLayout from './layouts/FlowLayout'
import LandingPage from './pages/LandingPage/LandingPage'
import WelcomePage from './pages/AuthPages/WelcomePage'
import LoginPage from './pages/AuthPages/LoginPage'
import RegisterPage from './pages/AuthPages/RegisterPage'
import OnboardingPage from './pages/OnboardingPage/OnboardingPage'
import HomePage from './pages/HomePage/HomePage'
import TrainingsPage from './pages/TrainingsPage/TrainingsPage'
import NutritionPage from './pages/NutritionPage/NutritionPage'
import KnowledgePage from './pages/KnowledgePage/KnowledgePage'
import StatsPage from './pages/StatsPage/StatsPage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import WorkoutPlanPage from './pages/WorkoutPlanPage/WorkoutPlanPage'
import WorkoutSessionPage from './pages/WorkoutSessionPage/WorkoutSessionPage'
import ExercisePage from './pages/ExercisePage/ExercisePage'
import WorkoutCompletePage from './pages/WorkoutCompletePage/WorkoutCompletePage'
import ArticlePage from './pages/ArticlePage/ArticlePage'
import './styles/app-shell.scss'

function App() {
  return (
    <AppUIProvider>
      <BrowserRouter>
        <AuthGate>
          <Routes>
            <Route path="landing" element={<LandingPage />} />
            <Route path="welcome" element={<WelcomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="onboarding" element={<OnboardingPage />} />

            <Route element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="trainings" element={<TrainingsPage />} />
              <Route path="nutrition" element={<NutritionPage />} />
              <Route path="knowledge" element={<KnowledgePage />} />
              <Route path="analytics" element={<StatsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            <Route element={<FlowLayout />}>
              <Route path="trainings/:programId" element={<WorkoutPlanPage />} />
              <Route path="trainings/:programId/session" element={<WorkoutSessionPage />} />
              <Route path="trainings/:programId/exercise/:index" element={<ExercisePage />} />
              <Route path="trainings/:programId/complete" element={<WorkoutCompletePage />} />
              <Route path="article/:articleId" element={<ArticlePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthGate>
      </BrowserRouter>
    </AppUIProvider>
  )
}

export default App
