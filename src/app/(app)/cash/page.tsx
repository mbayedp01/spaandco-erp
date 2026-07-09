import { Header } from '@/components/layout/header'
import { getCashTransactions } from '@/lib/db/cash'
import { getEstablishments } from '@/lib/db/establishments'
import { getCurrentSpaId } from '@/lib/spa'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { AddTransactionButton } from '@/components/forms/transaction-form'
import { PrintReceiptButton } from '@/components/receipts/print-receipt'
import { CashFilterBar } from './filter-bar'

const methodColor: Record<string, string> = {
  Carte:           'bg-blue-50 text-blue-700',
  Cash:            'bg-emerald-50 text-emerald-700',
  'Mobile Money':  'bg-orange-50 text-orange-700',
  Virement:        'bg-purple-50 text-purple-700',
  Wave:            'bg-teal-50 text-teal-700',
  'Orange Money':  'bg-orange-50 text-orange-800',
}

function applyFilters(
  txs: Awaited<ReturnType<typeof getCashTransactions>>,
  period: string, type: string, caissier: string
) {
  const today = new Date().toISOString().split('T')[0]
  let result = txs

  if (period === 'today') {
    result = result.filter((t) => t.date === today)
  } else if (period === 'week') {
    const d = new Date(); d.setDate(d.getDate() - 7)
    const from = d.toISOString().split('T')[0]
    result = result.filter((t) => t.date >= from)
  } else if (period === 'month') {
    const d = new Date()
    const from = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
    result = result.filter((t) => t.date >= from)
  }

  if (type === 'recette' || type === 'charge') {
    result = result.filter((t) => t.type === type)
  }

  if (caissier !== 'all' && caissier) {
    result = result.filter((t) => (t as any).created_by === caissier)
  }

  return result
}

export default async function CashPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const spaId  = getCurrentSpaId()
  const params = await searchParams

  const period   = params.period   ?? 'all'
  const type     = params.type     ?? 'all'
  const caissier = params.caissier ?? 'all'

  const [allTransactions, allEstablishments] = await Promise.all([
    getCashTransactions(spaId),
    getEstablishments(),
  ])

  const transactions = applyFilters(allTransactions, period, type, caissier)

  const establishment = allEstablishments.find((e) => e.id === spaId) ?? allEstablishments[0] ?? {
    name: 'Spa and Co', city: 'Dakar', address: null, phone: null,
  }

  const today = new Date().toISOString().split('T')[0]
  const todayTx = allTransactions.filter((t) => t.date === today)

  const totalEnc = transactions.filter((t) => t.type === 'recette').reduce((s, t) => s + t.amount, 0)
  const totalDep = transactions.filter((t) => t.type === 'charge').reduce((s, t) => s + t.amount, 0)
  const solde    = totalEnc - totalDep

  const caissiers = [...new Set(
    allTransactions
      .map((t) => (t as any).created_by as string | null | undefined)
      .filter((c): c is string => Boolean(c))
  )]

  return (
    <>
      <Header title="Caisse du jour" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">

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
            <h2 className="font-semibold text-slate-900">
              Transactions
              {todayTx.length > 0 && (
                <span className="ml-2 text-sm font-normal text-stone-400">
                  ({todayTx.length} aujourd&apos;hui)
                </span>
              )}
            </h2>
            <AddTransactionButton />
          </div>

          {/* Filtres */}
          <div className="border-b border-stone-100 px-5 py-3">
            <CashFilterBar
              period={period}
              type={type}
              caissier={caissier}
              caissiers={caissiers}
            />
          </div>

          <div className="divide-y divide-stone-100">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-stone-50">
                <span className="w-16 shrink-0 text-xs text-stone-400">{t.date}</span>
                <div className={cn(
                  'h-1.5 w-1.5 shrink-0 rounded-full',
                  t.type === 'recette' ? 'bg-emerald-500' : 'bg-rose-400'
                )} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{t.label}</p>
                  {t.category && <p className="text-xs text-stone-400">{t.category}</p>}
                  {(t as any).created_by && (
                    <p className="text-xs text-stone-300">{(t as any).created_by}</p>
                  )}
                </div>
                {t.payment_method && (
                  <span className={cn(
                    'hidden shrink-0 rounded-full px-2 py-0.5 text-xs font-medium sm:inline',
                    methodColor[t.payment_method] ?? 'bg-stone-100 text-stone-600'
                  )}>
                    {t.payment_method}
                  </span>
                )}
                <span className={cn(
                  'w-28 shrink-0 text-right font-semibold tabular-nums',
                  t.type === 'recette' ? 'text-emerald-700' : 'text-rose-700'
                )}>
                  {t.type === 'recette' ? '+' : '−'}{t.amount.toLocaleString('fr-FR')} F
                </span>
                <PrintReceiptButton transaction={t} establishment={establishment} />
              </div>
            ))}

            {transactions.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-stone-400">
                Aucune transaction pour ce filtre.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
