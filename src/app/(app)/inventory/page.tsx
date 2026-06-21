import { Header } from '@/components/layout/header'
import { inventory } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { AlertTriangle, Plus, Package } from 'lucide-react'

const categoryColor: Record<string, string> = {
  Huiles: 'bg-amber-50 text-amber-700',
  'Soins corps': 'bg-emerald-50 text-emerald-700',
  'Soins visage': 'bg-pink-50 text-pink-700',
  Équipement: 'bg-blue-50 text-blue-700',
  Linge: 'bg-stone-100 text-stone-600',
  Accessoires: 'bg-purple-50 text-purple-700',
  Beauté: 'bg-rose-50 text-rose-700',
}

export default function InventoryPage() {
  const low = inventory.filter((i) => i.stock < i.minStock)
  const ok = inventory.filter((i) => i.stock >= i.minStock)
  const totalValue = inventory.reduce((s, i) => s + i.stock * i.price, 0)

  return (
    <>
      <Header title="Gestion des stocks" />
      <div className="flex-1 overflow-y-auto p-6">
        {low.length > 0 && (
          <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <strong>{low.length} article{low.length > 1 ? 's' : ''} en rupture imminente :</strong>{' '}
              {low.map((i) => i.name).join(' · ')}
            </span>
          </div>
        )}

        {/* KPIs */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Références', value: inventory.length },
            { label: 'Stock OK', value: ok.length },
            { label: 'Stock bas', value: low.length },
            { label: 'Valeur totale', value: `${totalValue.toLocaleString('fr-FR')} F` },
          ].map((k) => (
            <div key={k.label} className="rounded-lg border border-stone-200 bg-white p-5 shadow-xs">
              <p className="text-xs text-stone-500">{k.label}</p>
              <p className={cn('mt-1 text-xl font-bold', k.label === 'Stock bas' && Number(k.value) > 0 ? 'text-rose-600' : 'text-slate-900')}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-lg border border-stone-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Articles ({inventory.length})</h2>
            <button className="flex items-center gap-2 rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 cursor-pointer">
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50 text-left text-xs font-medium text-stone-400">
                  <th className="px-5 py-3">Produit</th>
                  <th className="px-5 py-3">Catégorie</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="hidden px-5 py-3 md:table-cell">Fournisseur</th>
                  <th className="hidden px-5 py-3 sm:table-cell">P.U.</th>
                  <th className="px-5 py-3">Niveau</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {inventory.map((item) => {
                  const isLow = item.stock < item.minStock
                  const pct = Math.min((item.stock / (item.minStock * 2)) * 100, 100)
                  return (
                    <tr key={item.id} className="hover:bg-stone-50">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 shrink-0 text-stone-300" />
                          <span className="font-medium text-slate-900">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', categoryColor[item.category] ?? 'bg-stone-100 text-stone-600')}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn('font-bold', isLow ? 'text-rose-600' : 'text-slate-900')}>
                          {item.stock}
                        </span>
                        <span className="ml-1 text-xs text-stone-400">{item.unit}</span>
                        <span className="ml-1 text-xs text-stone-300">/ min {item.minStock}</span>
                      </td>
                      <td className="hidden px-5 py-3.5 text-xs text-stone-500 md:table-cell">{item.supplier}</td>
                      <td className="hidden px-5 py-3.5 text-slate-700 sm:table-cell">{item.price.toLocaleString('fr-FR')} F</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-stone-100">
                            <div
                              className={cn('h-full rounded-full', isLow ? 'bg-rose-400' : 'bg-emerald-500')}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className={cn('text-xs font-medium', isLow ? 'text-rose-600' : 'text-emerald-600')}>
                            {isLow ? 'Bas' : 'OK'}
                          </span>
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
