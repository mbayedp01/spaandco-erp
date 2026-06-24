import { Header } from '@/components/layout/header'
import { getMembershipPlans, getMemberships } from '@/lib/db/subscriptions'
import { AddSubscriptionButton } from '@/components/forms/subscription-form'
import { cn } from '@/lib/utils'
import { BadgeCheck, TrendingUp } from 'lucide-react'

const statusConfig: Record<string, { label: string; className: string }> = {
  actif:    { label: 'Actif',    className: 'bg-emerald-50 text-emerald-700' },
  suspendu: { label: 'Suspendu', className: 'bg-amber-50 text-amber-700' },
  annule:   { label: 'Annulé',   className: 'bg-rose-50 text-rose-700' },
}

const planBadge: Record<string, string> = {
  Bronze:   'bg-amber-50 text-amber-700',
  Silver:   'bg-slate-100 text-slate-600',
  Gold:     'bg-yellow-50 text-yellow-700',
  Platinum: 'bg-primary-50 text-primary-700',
}

export default async function SubscriptionsPage() {
  const [plans, memberships] = await Promise.all([getMembershipPlans(), getMemberships()])

  const activeCount    = memberships.filter((m) => m.status === 'actif').length
  const monthlyRevenue = memberships
    .filter((m) => m.status === 'actif')
    .reduce((sum, m) => {
      const plan = plans.find((p) => p.name === m.plan_name)
      return sum + (plan?.price ?? 0)
    }, 0)

  return (
    <>
      <Header title="Abonnements" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50">
              <BadgeCheck className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Abonnés actifs</p>
              <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Revenu récurrent</p>
              <p className="text-2xl font-bold text-emerald-700">{monthlyRevenue.toLocaleString('fr-FR')} F</p>
              <p className="text-xs text-stone-400">par mois</p>
            </div>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
            <p className="text-sm text-stone-500">Répartition plans</p>
            <div className="mt-2 space-y-1.5">
              {plans.map((p) => {
                const count = memberships.filter((m) => m.plan_name === p.name && m.status === 'actif').length
                return (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span className="text-stone-600">{p.name}</span>
                    <span className="font-semibold text-slate-900">{count} abonné{count > 1 ? 's' : ''}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <h2 className="mb-4 font-semibold text-slate-900">Formules disponibles</h2>
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const subscriberCount = memberships.filter((m) => m.plan_name === plan.name && m.status === 'actif').length
            return (
              <div key={plan.id} className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs">
                <div className={cn('bg-gradient-to-br p-5 text-white', plan.color ?? 'from-primary-500 to-primary-700')}>
                  <p className="text-sm font-medium opacity-90">{plan.name}</p>
                  <p className="mt-1 text-2xl font-bold">{plan.price.toLocaleString('fr-FR')} F</p>
                  <p className="text-xs opacity-75">/ mois</p>
                </div>
                <div className="p-4">
                  <ul className="space-y-1.5">
                    {plan.avantages.map((a) => (
                      <li key={a} className="flex items-start gap-2 text-xs text-stone-600">
                        <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-500" />
                        {a}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3">
                    <span className="text-xs text-stone-400">{subscriberCount} abonné{subscriberCount > 1 ? 's' : ''}</span>
                    <span className="text-xs font-medium text-primary-600">-{plan.remise}% remise</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="rounded-lg border border-stone-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Abonnés ({memberships.length})</h2>
            <AddSubscriptionButton plans={plans} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50 text-left text-xs font-medium text-stone-400">
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Formule</th>
                  <th className="hidden px-5 py-3 sm:table-cell">Depuis</th>
                  <th className="hidden px-5 py-3 md:table-cell">Soins restants</th>
                  <th className="hidden px-5 py-3 lg:table-cell">Prochaine facture</th>
                  <th className="px-5 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {memberships.map((m) => {
                  const sc = statusConfig[m.status] ?? statusConfig.actif
                  const plan = plans.find((p) => p.name === m.plan_name)
                  return (
                    <tr key={m.id} className="hover:bg-stone-50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                            {(m.client_name ?? '?').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <p className="font-medium text-slate-900">{m.client_name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', planBadge[m.plan_name ?? ''] ?? 'bg-stone-100 text-stone-600')}>
                          {m.plan_name}
                        </span>
                        {plan && <span className="ml-2 text-xs text-stone-400">{plan.price.toLocaleString('fr-FR')} F/mois</span>}
                      </td>
                      <td className="hidden px-5 py-3.5 text-stone-500 sm:table-cell">{m.since}</td>
                      <td className="hidden px-5 py-3.5 md:table-cell">
                        {m.soins_restants === 'illimité' ? (
                          <span className="text-xs font-medium text-primary-600">Illimité</span>
                        ) : m.soins_restants === '0' ? (
                          <span className="text-xs font-medium text-rose-600">Épuisé</span>
                        ) : (
                          <span className="text-xs font-medium text-emerald-600">{m.soins_restants} restant{Number(m.soins_restants) > 1 ? 's' : ''}</span>
                        )}
                      </td>
                      <td className="hidden px-5 py-3.5 text-stone-500 lg:table-cell">{m.next_billing}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', sc.className)}>{sc.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
