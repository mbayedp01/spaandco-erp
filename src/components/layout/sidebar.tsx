'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import { getNavItemsForRole } from './nav-items'
import { SpaSwitcher } from './spa-switcher'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/roles'
import type { UserRole } from '@/lib/roles'

type Establishment = { id: string; name: string; city: string }

interface SidebarProps {
  establishments: Establishment[]
  currentSpaId: string
  userRole: UserRole
}

export function Sidebar({ establishments, currentSpaId, userRole }: SidebarProps) {
  const pathname = usePathname()
  const items    = getNavItemsForRole(userRole)

  return (
    <aside
      className="hidden w-64 shrink-0 flex-col text-stone-300 lg:flex border-r-2 border-r-primary-600"
      style={{ backgroundColor: 'rgb(var(--sidebar-bg))' }}
    >
      <div className="flex h-14 items-center gap-2 px-6">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-bold text-white">Spa and Co</span>
      </div>

      <div className="border-b pb-1" style={{ borderColor: 'rgb(var(--sidebar-mid))' }}>
        {userRole === 'admin' ? (
          <SpaSwitcher establishments={establishments} currentSpaId={currentSpaId} />
        ) : (
          /* Caissier : affiche son spa en lecture seule, sans switcher */
          <div className="px-3 pb-3">
            <div className="flex items-center gap-2.5 rounded-md bg-white/5 px-3 py-2.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white bg-primary-600">
                {(establishments[0]?.name[0] ?? '?')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-semibold text-white">{establishments[0]?.name ?? '—'}</p>
                <p className="text-[10px] text-stone-500">{establishments[0]?.city ?? ''}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {items.map((item) => {
          const active = pathname.startsWith(item.href)
          const Icon   = item.icon
          return (
            <div key={item.href}>
              {item.section && (
                <p className="mb-1 mt-4 px-3 text-[10px] font-semibold uppercase tracking-widest text-stone-600 first:mt-0">
                  {item.section}
                </p>
              )}
              <Link href={item.href}>
                <span
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-primary-600 text-white'
                      : 'text-stone-400 hover:text-white',
                  )}
                  style={!active ? undefined : undefined}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgb(var(--sidebar-mid))' }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = '' }}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 whitespace-nowrap">{item.label}</span>
                </span>
              </Link>
            </div>
          )
        })}
      </nav>

      <div className="border-t px-5 py-3" style={{ borderColor: 'rgb(var(--sidebar-mid))' }}>
        <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold', ROLE_COLORS[userRole])}>
          {ROLE_LABELS[userRole]}
        </span>
        <p className="mt-1 text-[10px] text-stone-600">Spa and Co · v0.1</p>
      </div>
    </aside>
  )
}
