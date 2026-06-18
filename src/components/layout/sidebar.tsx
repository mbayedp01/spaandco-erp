'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Sparkles,
  Package,
  CreditCard,
  Calculator,
  Megaphone,
  BarChart3,
  Settings,
} from 'lucide-react'

const nav = [
  { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Clients', href: '/clients', icon: Users },
  { label: 'Rendez-vous', href: '/appointments', icon: CalendarDays },
  { label: 'Prestations', href: '/services', icon: Sparkles },
  { label: 'Stocks', href: '/inventory', icon: Package, soon: true },
  { label: 'Caisse', href: '/cash', icon: CreditCard, soon: true },
  { label: 'Comptabilité', href: '/accounting', icon: Calculator, soon: true },
  { label: 'Marketing', href: '/marketing', icon: Megaphone, soon: true },
  { label: 'Rapports', href: '/reports', icon: BarChart3, soon: true },
  { label: 'Paramètres', href: '/settings', icon: Settings, soon: true },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-stone-300 lg:flex">
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-600">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold text-white">ZenSpa</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) => {
          const active = pathname.startsWith(item.href)
          const Icon = item.icon
          const content = (
            <span
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-primary-600 text-white'
                  : 'text-stone-400 hover:bg-sidebar-light hover:text-white',
                item.soon && 'cursor-default opacity-50 hover:bg-transparent hover:text-stone-400'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.soon && (
                <span className="rounded bg-sidebar-light px-1.5 py-0.5 text-[10px] font-medium text-stone-400">
                  bientôt
                </span>
              )}
            </span>
          )

          return item.soon ? (
            <div key={item.href}>{content}</div>
          ) : (
            <Link key={item.href} href={item.href}>
              {content}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-light px-6 py-4 text-xs text-stone-500">
        ZenSpa Dakar · v0.1
      </div>
    </aside>
  )
}
