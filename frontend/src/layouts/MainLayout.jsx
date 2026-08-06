import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import BottomNav from '../components/layout/BottomNav'
import TopStatus from '../components/layout/TopStatus'
import CalendarModal from '../components/organisms/CalendarModal/CalendarModal'
import { NAV_ITEMS } from '../data/mockData'
import { useAppUI } from '../context/AppUIContext'
import { getStreak } from '../api/analytics'

function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { showInfo, authReady, t } = useAppUI()
  const [streak, setStreak] = useState(0)
  const [calendarOpen, setCalendarOpen] = useState(false)

  useEffect(() => {
    if (!authReady) return
    getStreak().then(({ data }) => setStreak(data.current)).catch(() => {})
  }, [authReady])

  const resolvedActive =
    location.pathname === '/' ? 'home'
    : location.pathname.startsWith('/trainings') ? 'trainings'
    : location.pathname.startsWith('/analytics') ? 'analytics'
    : location.pathname.startsWith('/profile') ? 'profile'
    : ''

  return (
    <div className="app-shell">
      {location.pathname === '/' && (
        <TopStatus
          streak={streak}
          onStreakClick={() =>
            showInfo(t('home.streakTitle'), t('home.streakMessage', { streak }))
          }
          onCalendarClick={() => setCalendarOpen(true)}
        />
      )}

      {calendarOpen ? <CalendarModal onClose={() => setCalendarOpen(false)} /> : null}

      <main className="screen">
        <Outlet />
      </main>

      <BottomNav
        items={NAV_ITEMS.map((item) => ({ ...item, label: t(`nav.${item.key}`) }))}
        activePage={resolvedActive}
        onChange={(item) => {
          const path = item.key === 'home' ? '/' : `/${item.key}`
          navigate(path)
        }}
      />
    </div>
  )
}

export default MainLayout
