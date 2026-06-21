import { Header } from '@/components/layout/header'
import { revenueByMonth } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const transactions = [
  { date: '18 juin', label: 'Recettes journée', type: 'recette', amount: 123000 },
  { date: '18 juin', label: 'Salaires thérapeutes', type: 'charge', amount: 48000 },
  { date: '18 juin', label: 'Fournitures spa', type: 'charge', amount: 25500 },
  { date: '17 juin', label: 'Recettes journée', type: 'recette', amount: 98000 },
  { date: '17 juin', label: 'Location équipement', type: 'charge', amount: 12000 },
  { date: '16 juin', label: 'Recettes journée', type: 'recette', amount: 145000 },
  { date: '16 juin', label: 'Maintenance locaux', type: 'charge', amount: 35000 },
]

export default function AccountingPage() {
  const lastMonth = revenueByMonth[revenueByMonth.length - 1]
  const profit = lastMonth.ca - lastMonth.depenses

  return (
    <>
      <Header title="Comptabilité" />
      <div className="flex-1 overflow-y-auto p-6">
        {/* KPIs */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'CA ce mois', value: `${lastMonth.ca.toLocaleString('fr-FR')} F`, color: 'text-emerald-700' },
            { label: 'Dépenses', value: `${lastMonth.depenses.toLocaleString('fr-FR')} F`, color: 'text-rose-700' },
            { label: 'Bénéfice net', value: `${profit.toLocaleString('fr-FR')} F`, color: 'text-primary-700' },
          ].map((k) => (
            <div key={k.label} className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
              <p className="text-sm text-stone-500">{k.label}</p>
              <p className={cn('mt-1 text-2xl font-bold', k.color)}>{k.value}</p>
              <p className="mt-0.5 text-xs text-stone-400">Juin 2026</p>
            </div>
          ))}
        </div>

        {/* Résumé mensuel */}
        <div className="mb-6 rounded-lg border border-stone-200 bg-white shadow-xs">
          <div className="border-b border-stone-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Synthèse mensuelle</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50 text-left text-xs font-medium text-stone-400">
                  <th className="px-5 py-3">Mois</th>
                  <th className="px-5 py-3">Chiffre d&apos;affaires</th>
                  <th className="px-5 py-3">Dépenses</th>
                  <th className="px-5 py-3">Bénéfice</th>
                  <th className="px-5 py-3">Marge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {revenueByMonth.map((m) => {
                  const b = m.ca - m.depenses
                  const marge = Math.round((b / m.ca) * 100)
                  return (
                    <tr key={m.month} className="hover:bg-stone-50">
                      <td className="px-5 py-3 font-medium text-slate-900">{m.month}</td>
                      <td className="px-5 py-3 text-emerald-700">{m.ca.toLocaleString('fr-FR')} F</td>
                      <td className="px-5 py-3 text-rose-600">{m.depenses.toLocaleString('fr-FR')} F</td>
                      <td className="px-5 py-3 font-semibold text-primary-700">{b.toLocaleString('fr-FR')} F</td>
                      <td className="px-5 py-3">
                        <span className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          marge >= 40 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        )}>
                          {marge}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transactions récentes */}
        <div className="rounded-lg border border-stone-200 bg-white shadow-xs">
          <div className="border-b border-stone-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Écritures récentes</h2>
          </div>
          <div className="divide-y divide-stone-100">
            {transactions.map((t, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3 text-sm">
                <span className="w-16 text-xs text-stone-400">{t.date}</span>
                <span className="flex-1 text-slate-700">{t.label}</span>
                <span className={cn(
                  'font-semibold',
                  t.type === 'recette' ? 'text-emerald-700' : 'text-rose-600'
                )}>
                  {t.type === 'recette' ? '+' : '−'}{t.amount.toLocaleString('fr-FR')} F
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
