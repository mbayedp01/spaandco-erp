'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import { navItems } from './nav-items'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-stone-300 lg:flex">
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-600">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold text-white">Spa and Co</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href)
          const Icon = item.icon
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

      <div className="border-t border-sidebar-light px-6 py-4 text-xs text-stone-500">
        Spa and Co · v0.1
      </div>
    </aside>
  )
}
