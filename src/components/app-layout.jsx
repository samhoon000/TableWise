import { Outlet } from 'react-router-dom'
import { TopNav } from './top-nav.jsx'
import { SiteFooter } from './site-footer.jsx'

export function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-stone-50">
      <TopNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
