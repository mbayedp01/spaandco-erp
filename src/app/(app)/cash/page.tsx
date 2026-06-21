import { Header } from '@/components/layout/header'
import { cashTransactions } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, Plus } from 'lucide-react'

const methodColor: Record<string, string> = {
  Carte: 'bg-blue-50 text-blue-700',
  Espèces: 'bg-emerald-50 text-emerald-700',
  'Mobile Money': 'bg-orange-50 text-orange-700',
}

export default function CashPage() {
  const encaissements = cashTransactions.filter((t) => t.type === 'encaissement')
  const depenses = cashTransactions.filter((t) => t.type === 'depense')
  const totalEnc = encaissements.reduce((s, t) => s + t.amount, 0)
  const totalDep = depenses.reduce((s, t) => s + t.amount, 0)
  const solde = totalEnc - totalDep

  return (
    <>
      <Header title="Caisse du jour" />
      <div className="flex-1 overflow-y-auto p-6">
        {/* KPIs */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Encaissements</p>
              <p className="text-2xl font-bold text-emerald-700">{totalEnc.toLocaleString('fr-FR')} F</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50">
              <TrendingDown className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Dépenses</p>
              <p className="text-2xl font-bold text-rose-700">{totalDep.toLocaleString('fr-FR')} F</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50">
              <Wallet className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Solde net</p>
              <p className="text-2xl font-bold text-primary-700">{solde.toLocaleString('fr-FR')} F</p>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="rounded-lg border border-stone-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Transactions du jour</h2>
            <button className="flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 cursor-pointer">
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </div>
          <div className="divide-y divide-stone-100">
            {cashTransactions.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-3 text-sm">
                <span className="w-12 text-stone-400">{t.time}</span>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{t.label}</p>
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', methodColor[t.method])}>
                  {t.method}
                </span>
                <span className={cn(
                  'w-28 text-right font-semibold',
                  t.type === 'encaissement' ? 'text-emerald-700' : 'text-rose-700'
                )}>
                  {t.type === 'encaissement' ? '+' : '−'}{t.amount.toLocaleString('fr-FR')} F
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
