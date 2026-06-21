'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Sparkles, Menu, X } from 'lucide-react'
import { navItems } from './nav-items'

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md p-2 text-stone-600 hover:bg-stone-100 lg:hidden cursor-pointer"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-sidebar text-stone-300">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-600">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-bold text-white">Spa and Co</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-stone-400 hover:bg-sidebar-light hover:text-white cursor-pointer"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" />
              </button>
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
                    <Link href={item.href} onClick={() => setOpen(false)}>
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
          </aside>
        </div>
      )}
    </>
  )
}
