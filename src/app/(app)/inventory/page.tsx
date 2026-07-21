import { Header } from '@/components/layout/header'
import { getInventory } from '@/lib/db/inventory'
import { getSuppliers } from '@/lib/db/suppliers'
import { getCurrentSpaId } from '@/lib/spa'
import { cn } from '@/lib/utils'
import { AlertTriangle, Package } from 'lucide-react'
import { AddInventoryButton, EditInventoryButton, DeleteInventoryButton } from '@/components/forms/inventory-form'

const categoryColor: Record<string, string> = {
  Huiles: 'bg-amber-50 text-amber-700',
  'Soins corps': 'bg-emerald-50 text-emerald-700',
  'Soins visage': 'bg-pink-50 text-pink-700',
  Équipement: 'bg-blue-50 text-blue-700',
  Linge: 'bg-stone-100 text-stone-600',
  Beauté: 'bg-rose-50 text-rose-700',
}

export default async function InventoryPage() {
  const spaId = getCurrentSpaId()
  const [items, suppliers] = await Promise.all([
    getInventory(spaId),
    getSuppliers(spaId),
  ])
  const supplierItems = suppliers.map(s => ({ id: s.id, name: s.name }))
  const low   = items.filter((i) => i.quantity < i.min_quantity)
  const ok    = items.filter((i) => i.quantity >= i.min_quantity)
  const totalValue = items.reduce((s, i) => s + i.quantity * (i.unit_price ?? 0), 0)

  return (
    <>
      <Header title="Stocks" />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {low.length > 0 && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <strong>{low.length} article{low.length > 1 ? 's' : ''} en rupture :</strong>{' '}
              {low.map((i) => i.name).join(' · ')}
            </span>
          </div>
        )}

        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {[
            { label: 'Références', value: items.length },
            { label: 'Stock OK',   value: ok.length },
            { label: 'Stock bas',  value: low.length },
            { label: 'Valeur totale', value: `${totalValue.toLocaleString('fr-FR')} F` },
          ].map((k) => (
            <div key={k.label} className="rounded-lg border border-stone-200 bg-white p-4 shadow-xs sm:p-5">
              <p className="text-xs text-stone-500">{k.label}</p>
              <p className={cn('mt-0.5 text-lg font-bold sm:text-xl', k.label === 'Stock bas' && Number(k.value) > 0 ? 'text-rose-600' : 'text-slate-900')}>
                {k.value}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-stone-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 sm:px-5 sm:py-4">
            <h2 className="font-semibold text-slate-900">Articles ({items.length})</h2>
            <AddInventoryButton suppliers={supplierItems} />
          </div>

          {/* Mobile: card list */}
          <div className="divide-y divide-stone-100 sm:hidden">
            {items.map((item) => {
              const isLow = item.quantity < item.min_quantity
              const pct = Math.min((item.quantity / Math.max(item.min_quantity * 2, 1)) * 100, 100)
              return (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <Package className="h-5 w-5 shrink-0 text-stone-300" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-stone-400">{item.category}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-stone-100">
                        <div className={cn('h-full rounded-full', isLow ? 'bg-rose-400' : 'bg-emerald-500')} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={cn('text-xs font-medium', isLow ? 'text-rose-600' : 'text-emerald-600')}>
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  </div>
                  <span className={cn('shrink-0 text-xs font-semibold', isLow ? 'text-rose-600' : 'text-emerald-600')}>
                    {isLow ? '⚠ Bas' : 'OK'}
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
                  <th className="px-5 py-3">Produit</th>
                  <th className="px-5 py-3">Catégorie</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="hidden px-5 py-3 md:table-cell">Fournisseur</th>
                  <th className="px-5 py-3">P.U.</th>
                  <th className="px-5 py-3">Niveau</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {items.map((item) => {
                  const isLow = item.quantity < item.min_quantity
                  const pct = Math.min((item.quantity / Math.max(item.min_quantity * 2, 1)) * 100, 100)
                  return (
                    <tr key={item.id} className="hover:bg-stone-50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 shrink-0 text-stone-300" />
                          <span className="font-medium text-slate-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', categoryColor[item.category ?? ''] ?? 'bg-stone-100 text-stone-600')}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('font-bold', isLow ? 'text-rose-600' : 'text-slate-900')}>{item.quantity}</span>
                        <span className="ml-1 text-xs text-stone-400">{item.unit}</span>
                        <span className="ml-1 text-xs text-stone-300">/ min {item.min_quantity}</span>
                      </td>
                      <td className="hidden px-5 py-3.5 text-xs text-stone-500 md:table-cell">{item.supplier}</td>
                      <td className="px-5 py-3.5 text-slate-700">
                        {item.unit_price ? `${item.unit_price.toLocaleString('fr-FR')} F` : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-stone-100">
                            <div className={cn('h-full rounded-full', isLow ? 'bg-rose-400' : 'bg-emerald-500')} style={{ width: `${pct}%` }} />
                          </div>
                          <span className={cn('text-xs font-medium', isLow ? 'text-rose-600' : 'text-emerald-600')}>
                            {isLow ? 'Bas' : 'OK'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-0.5">
                          <EditInventoryButton item={item} suppliers={supplierItems} />
                          <DeleteInventoryButton id={item.id} />
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
