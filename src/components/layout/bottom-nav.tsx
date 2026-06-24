'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, CalendarDays, CreditCard, MoreHorizontal, Stethoscope } from 'lucide-react'
import { useState } from 'react'
import { getNavItemsForRole } from './nav-items'
import { SpaSwitcher } from './spa-switcher'
import { useSpa } from './spa-context'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/roles'

const ALL_PRIMARY_TABS = [
  { label: 'Accueil', href: '/dashboard',    icon: LayoutDashboard, roles: ['admin','caissier','medecin'] },
  { label: 'Clients', href: '/clients',       icon: Users,           roles: ['admin','caissier','medecin'] },
  { label: 'RDV',     href: '/appointments',  icon: CalendarDays,    roles: ['admin','caissier','medecin'] },
  { label: 'Caisse',  href: '/cash',          icon: CreditCard,      roles: ['admin','caissier'] },
  { label: 'Soins',   href: '/services',      icon: Stethoscope,     roles: ['medecin'] },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const { establishments, currentSpaId, userRole } = useSpa()

  const primaryTabs = ALL_PRIMARY_TABS.filter(t => (t.roles as readonly string[]).includes(userRole))
  const allItems = getNavItemsForRole(userRole)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-stone-200 bg-white lg:hidden">
        {primaryTabs.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href} className="flex flex-1 flex-col items-center gap-0.5 py-2">
              <Icon className={cn('h-5 w-5', active ? 'text-primary-600' : 'text-stone-400')} />
              <span className={cn('text-[10px] font-medium', active ? 'text-primary-600' : 'text-stone-400')}>
                {label}
              </span>
            </Link>
          )
        })}
        <button
          onClick={() => setMenuOpen(true)}
          className="flex flex-1 flex-col items-center gap-0.5 py-2 cursor-pointer"
        >
          <MoreHorizontal className="h-5 w-5 text-stone-400" />
          <span className="text-[10px] font-medium text-stone-400">Plus</span>
        </button>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)} aria-hidden />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white shadow-2xl">
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-stone-200" />
            </div>

            {/* Role badge */}
            <div className="mx-4 mb-2 flex items-center justify-between">
              <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', ROLE_COLORS[userRole])}>
                {ROLE_LABELS[userRole]}
              </span>
            </div>

            {/* Spa switcher — admin only */}
            {userRole === 'admin' && establishments.length > 0 && (
              <div className="mx-4 mb-3 rounded-xl bg-sidebar overflow-hidden">
                <SpaSwitcher establishments={establishments} currentSpaId={currentSpaId} />
              </div>
            )}

            <div className="overflow-y-auto px-4 pb-8" style={{ maxHeight: '60vh' }}>
              {allItems.map((item) => {
                const active = pathname.startsWith(item.href)
                const Icon = item.icon
                return (
                  <div key={item.href}>
                    {item.section && (
                      <p className="mb-1 mt-4 text-[10px] font-semibold uppercase tracking-widest text-stone-400 first:mt-2">
                        {item.section}
                      </p>
                    )}
                    <Link href={item.href} onClick={() => setMenuOpen(false)}>
                      <span className={cn(
                        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                        active ? 'bg-primary-50 text-primary-700' : 'text-stone-700 hover:bg-stone-50'
                      )}>
                        <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-primary-600' : 'text-stone-400')} />
                        {item.label}
                      </span>
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
