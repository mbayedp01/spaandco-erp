'use client'

import { Download } from 'lucide-react'

interface MonthRow { month: string; ca: number; depenses: number }
interface Transaction { date: string; label: string; type: string; amount: number }

interface ExportButtonProps {
  spaName: string
  monthlyData: MonthRow[]
  transactions: Transaction[]
}

export function ExportButton({ spaName, monthlyData, transactions }: ExportButtonProps) {
  function handleExport() {
    const lines: string[] = []

    lines.push(`Spa:,${spaName}`)
    lines.push(`Exporté le:,${new Date().toLocaleDateString('fr-FR')}`)
    lines.push('')

    lines.push('SYNTHÈSE MENSUELLE')
    lines.push('Mois,CA (F),Dépenses (F),Bénéfice (F),Marge %')
    for (const m of monthlyData) {
      const benefice = m.ca - m.depenses
      const marge = m.ca > 0 ? Math.round((benefice / m.ca) * 100) : 0
      lines.push(`${m.month},${m.ca},${m.depenses},${benefice},${marge}%`)
    }

    lines.push('')
    lines.push('TRANSACTIONS RÉCENTES')
    lines.push('Date,Libellé,Type,Montant (F)')
    for (const t of transactions) {
      const sign = t.type === 'recette' ? '+' : '-'
      lines.push(`${t.date},"${t.label.replace(/"/g, '""')}",${t.type},${sign}${t.amount}`)
    }

    const csv = lines.join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `comptabilite-${spaName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 rounded-md border border-stone-200 px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-50 cursor-pointer transition-colors"
    >
      <Download className="h-3.5 w-3.5" />
      Export CSV
    </button>
  )
}
