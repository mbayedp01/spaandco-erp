import { Bell, Search } from 'lucide-react'
import { MobileNav } from './mobile-nav'

export function Header({ title }: { title: string }) {
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

        <button className="relative rounded-md p-2 text-stone-500 hover:bg-stone-100 cursor-pointer">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
        </button>

        <div className="flex items-center gap-3 border-l border-stone-200 pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
            A
          </div>
          <div className="hidden text-sm sm:block">
            <p className="font-medium text-slate-900">Administrateur</p>
            <p className="text-xs text-stone-400">Admin Général</p>
          </div>
        </div>
      </div>
    </header>
  )
}
