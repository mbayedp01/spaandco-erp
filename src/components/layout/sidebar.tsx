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

const SPA_ACTIVE: Record<string, string> = {
  Almadies: 'bg-teal-600 text-white',
  Plateau:  'bg-violet-600 text-white',
  Saly:     'bg-amber-600 text-white',
}

const SPA_BORDER: Record<string, string> = {
  Almadies: 'border-r-teal-500',
  Plateau:  'border-r-violet-500',
  Saly:     'border-r-amber-500',
}

export function Sidebar({ establishments, currentSpaId, userRole }: SidebarProps) {
  const pathname  = usePathname()
  const items     = getNavItemsForRole(userRole)
  const currentEst = establishments.find((e) => e.id === currentSpaId)
  const activeClass  = SPA_ACTIVE[currentEst?.name ?? '']  ?? 'bg-primary-600 text-white'
  const borderClass  = SPA_BORDER[currentEst?.name ?? '']  ?? 'border-r-primary-500'

  return (
    <aside className={cn('hidden w-64 shrink-0 flex-col bg-sidebar text-stone-300 lg:flex border-r-2', borderClass)}>
      <div className="flex h-14 items-center gap-2 px-6">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-bold text-white">Spa and Co</span>
      </div>

      <div className="border-b border-sidebar-light pb-1">
        <SpaSwitcher establishments={establishments} currentSpaId={currentSpaId} />
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
                      ? activeClass
                      : 'text-stone-400 hover:bg-sidebar-light hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 whitespace-nowrap">{item.label}</span>
                </span>
              </Link>
            </div>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-light px-5 py-3">
        <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold', ROLE_COLORS[userRole])}>
          {ROLE_LABELS[userRole]}
        </span>
        <p className="mt-1 text-[10px] text-stone-600">Spa and Co · v0.1</p>
      </div>
    </aside>
  )
}
