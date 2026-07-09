import { Bell, Search, LogOut } from 'lucide-react'
import { MobileNav } from './mobile-nav'
import { logout } from '@/lib/auth'
import { getCurrentUserRole } from '@/lib/user-role'
import { getRecentAuditLogs } from '@/lib/db/audit'
import { NotificationBell } from './notification-bell'

export async function Header({ title, userName }: { title: string; userName?: string }) {
  const role    = await getCurrentUserRole()
  const isAdmin = role === 'admin'
  const logs    = isAdmin ? await getRecentAuditLogs(25) : []

  const initials = userName
    ? userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A'

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-stone-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <MobileNav />
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 rounded-md border border-stone-200 px-3 py-1.5 text-sm text-stone-400 md:flex">
          <Search className="h-4 w-4" />
          <span>Rechercher…</span>
        </div>

        {isAdmin ? (
          <NotificationBell logs={logs} />
        ) : (
          <button className="relative rounded-md p-2 text-stone-400 cursor-default">
            <Bell className="h-5 w-5" />
          </button>
        )}

        <div className="flex items-center gap-3 border-l border-stone-200 pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
            {initials}
          </div>
          <div className="hidden text-sm sm:block">
            <p className="font-medium text-slate-900">{userName ?? 'Administrateur'}</p>
            <p className="text-xs text-stone-400">Admin Général</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              title="Déconnexion"
              className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-rose-500 cursor-pointer transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
