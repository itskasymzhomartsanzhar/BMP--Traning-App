import { Outlet } from 'react-router-dom'

function FlowLayout() {
  return (
    <div className="app-shell app-shell--flow">
      <main className="screen">
        <Outlet />
      </main>
    </div>
  )
}

export default FlowLayout
