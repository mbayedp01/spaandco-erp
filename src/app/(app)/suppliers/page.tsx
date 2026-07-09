import { Header } from '@/components/layout/header'
import { getSuppliers } from '@/lib/db/suppliers'
import { getCurrentSpaId } from '@/lib/spa'
import { cn } from '@/lib/utils'
import { Truck, AlertCircle, ShoppingCart } from 'lucide-react'
import { AddSupplierButton, EditSupplierButton, DeleteSupplierButton } from '@/components/forms/supplier-form'

const statusConfig: Record<string, { label: string; className: string }> = {
  actif:   { label: 'Actif',   className: 'bg-emerald-50 text-emerald-700' },
  inactif: { label: 'Inactif', className: 'bg-stone-100 text-stone-500' },
}

const categoryColor: Record<string, string> = {
  'Huiles & Produits naturels':    'bg-amber-50 text-amber-700',
  'Soins visage & corps':          'bg-pink-50 text-pink-700',
  'Équipement professionnel':      'bg-blue-50 text-blue-700',
  'Linge & Textiles':              'bg-stone-100 text-stone-600',
  'Beauté & Ongles':               'bg-purple-50 text-purple-700',
  'Huiles essentielles':           'bg-teal-50 text-teal-700',
  'Matériel médico-esthétique':    'bg-indigo-50 text-indigo-700',
}

export default async function SuppliersPage() {
  const spaId = getCurrentSpaId()
  const suppliers = await getSuppliers(spaId)
  const actifs = suppliers.filter((s) => s.status === 'actif')
  const pending = suppliers.reduce((sum, s) => sum + s.pending_orders, 0)
  const totalMonthly = actifs.reduce((sum, s) => sum + s.monthly_spend, 0)

  return (
    <>
      <Header title="Fournisseurs" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {pending > 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <ShoppingCart className="h-4 w-4 shrink-0" />
            <span>
              <strong>{pending} commande{pending > 1 ? 's' : ''} en attente</strong> chez{' '}
              {suppliers.filter((s) => s.pending_orders > 0).map((s) => s.name).join(', ')}
            </span>
          </div>
        )}

        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-xs sm:p-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50">
              <Truck className="h-4 w-4 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500">Actifs</p>
              <p className="text-xl font-bold text-slate-900">{actifs.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-xs sm:p-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-stone-500">En attente</p>
              <p className="text-xl font-bold text-slate-900">{pending}</p>
            </div>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-xs sm:p-5">
            <p className="text-xs text-stone-500">Dép./mois</p>
            <p className="mt-0.5 text-base font-bold text-slate-900">{totalMonthly.toLocaleString('fr-FR')} F</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-xs sm:p-5">
            <p className="text-xs text-stone-500">Catégories</p>
            <p className="mt-0.5 text-xl font-bold text-slate-900">{new Set(suppliers.map((s) => s.category)).size}</p>
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 sm:px-5 sm:py-4">
            <h2 className="font-semibold text-slate-900">Fournisseurs ({suppliers.length})</h2>
            <AddSupplierButton />
          </div>

          {/* Mobile: card list */}
          <div className="divide-y divide-stone-100 sm:hidden">
            {suppliers.map((s) => {
              const sc = statusConfig[s.status] ?? statusConfig.actif
              return (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100">
                    <Truck className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 truncate">{s.name}</p>
                      {s.pending_orders > 0 && (
                        <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                          {s.pending_orders}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400">{s.category}</p>
                    <p className="text-xs font-semibold text-slate-700">{s.monthly_spend.toLocaleString('fr-FR')} F/mois</p>
                  </div>
                  <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium', sc.className)}>
                    {sc.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50 text-left text-xs font-medium text-stone-400">
                  <th className="px-5 py-3">Fournisseur</th>
                  <th className="hidden px-5 py-3 md:table-cell">Catégorie</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="hidden px-5 py-3 lg:table-cell">Dernière commande</th>
                  <th className="px-5 py-3">Dép./mois</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {suppliers.map((s) => {
                  const sc = statusConfig[s.status] ?? statusConfig.actif
                  return (
                    <tr key={s.id} className="hover:bg-stone-50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100">
                            <Truck className="h-4 w-4 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{s.name}</p>
                            <p className="text-xs text-stone-400">{s.email}</p>
                          </div>
                          {s.pending_orders > 0 && (
                            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                              {s.pending_orders} en attente
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="hidden px-5 py-3.5 md:table-cell">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', categoryColor[s.category ?? ''] ?? 'bg-stone-100 text-stone-600')}>
                          {s.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-slate-700">{s.contact}</p>
                        <p className="text-xs text-stone-400">{s.phone}</p>
                      </td>
                      <td className="hidden px-5 py-3.5 text-stone-500 lg:table-cell">{s.last_order}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">{s.monthly_spend.toLocaleString('fr-FR')} F</td>
                      <td className="px-5 py-3.5">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', sc.className)}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-0.5">
                          <EditSupplierButton supplier={s} />
                          <DeleteSupplierButton id={s.id} />
                        </div>
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
