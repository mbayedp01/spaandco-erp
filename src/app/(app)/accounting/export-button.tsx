'use client'

import { Download, FileText } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface MonthRow { month: string; ca: number; depenses: number }
interface Transaction { date: string; label: string; type: string; amount: number }

interface ExportButtonProps {
  spaName: string
  monthlyData: MonthRow[]
  transactions: Transaction[]
  period?: string
}

export function ExportButton({ spaName, monthlyData, transactions, period = 'Toute la période' }: ExportButtonProps) {
  const [open, setOpen]  = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  function handleCSV() {
    setOpen(false)
    const lines: string[] = []
    lines.push(`Spa:,${spaName}`)
    lines.push(`Période:,${period}`)
    lines.push(`Exporté le:,${new Date().toLocaleDateString('fr-FR')}`)
    lines.push('')
    lines.push('SYNTHÈSE MENSUELLE')
    lines.push('Mois,CA (F),Dépenses (F),Bénéfice (F),Marge %')
    for (const m of monthlyData) {
      const b  = m.ca - m.depenses
      const mg = m.ca > 0 ? Math.round((b / m.ca) * 100) : 0
      lines.push(`${m.month},${m.ca},${m.depenses},${b},${mg}%`)
    }
    lines.push('')
    lines.push('TRANSACTIONS')
    lines.push('Date,Libellé,Type,Montant (F)')
    for (const t of transactions) {
      const sign = t.type === 'recette' ? '+' : '-'
      lines.push(`${t.date},"${t.label.replace(/"/g, '""')}",${t.type},${sign}${t.amount}`)
    }
    const csv  = lines.join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `comptabilite-${spaName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function handlePDF() {
    setOpen(false)
    const date    = new Date().toLocaleDateString('fr-FR')
    const totalCA = transactions.filter(t => t.type === 'recette').reduce((s, t) => s + t.amount, 0)
    const totalDp = transactions.filter(t => t.type === 'charge').reduce((s, t) => s + t.amount, 0)
    const profit  = totalCA - totalDp
    const marge   = totalCA > 0 ? Math.round((profit / totalCA) * 100) : 0

    const txRows = transactions.map(t => `
      <tr>
        <td>${t.date}</td>
        <td>${t.label}</td>
        <td>${t.type === 'recette' ? 'Recette' : 'Charge'}</td>
        <td class="${t.type === 'recette' ? 'pos' : 'neg'}">${t.type === 'recette' ? '+' : '−'}${t.amount.toLocaleString('fr-FR')} F</td>
      </tr>`).join('')

    const monthRows = monthlyData.map(m => {
      const b  = m.ca - m.depenses
      const mg = m.ca > 0 ? Math.round((b / m.ca) * 100) : 0
      return `<tr>
        <td>${m.month}</td>
        <td class="pos">${m.ca.toLocaleString('fr-FR')} F</td>
        <td class="neg">${m.depenses.toLocaleString('fr-FR')} F</td>
        <td class="hl">${b.toLocaleString('fr-FR')} F</td>
        <td>${mg}%</td>
      </tr>`
    }).join('')

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>Comptabilité — ${spaName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,Arial,sans-serif;font-size:12px;color:#1e293b;padding:28px 32px}
.header{border-bottom:3px solid #0d9488;padding-bottom:14px;margin-bottom:20px}
.header h1{font-size:22px;font-weight:700;color:#0d9488}
.header .meta{color:#64748b;margin-top:4px;font-size:11px}
.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:22px}
.kpi{border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px}
.kpi .lbl{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.5px}
.kpi .val{font-size:20px;font-weight:700;margin-top:4px}
h2{font-size:13px;font-weight:600;color:#475569;margin:18px 0 8px;text-transform:uppercase;letter-spacing:.5px}
table{width:100%;border-collapse:collapse;margin-top:4px}
th{background:#f8fafc;font-size:10px;font-weight:600;color:#64748b;text-transform:uppercase;padding:8px 10px;text-align:left;border-bottom:2px solid #e2e8f0}
td{padding:7px 10px;border-bottom:1px solid #f1f5f9;font-size:11px}
.pos{color:#059669;font-weight:600}
.neg{color:#dc2626}
.hl{color:#0d9488;font-weight:700}
.footer{margin-top:24px;font-size:10px;color:#94a3b8;text-align:right;border-top:1px solid #e2e8f0;padding-top:8px}
@media print{body{padding:16px}}
</style></head><body>
<div class="header">
  <h1>Comptabilité — ${spaName}</h1>
  <div class="meta">Période : ${period} &nbsp;·&nbsp; Exporté le ${date} &nbsp;·&nbsp; ${transactions.length} transaction(s)</div>
</div>
<div class="kpis">
  <div class="kpi"><div class="lbl">Chiffre d'affaires</div><div class="val pos">${totalCA.toLocaleString('fr-FR')} F</div></div>
  <div class="kpi"><div class="lbl">Dépenses</div><div class="val neg">${totalDp.toLocaleString('fr-FR')} F</div></div>
  <div class="kpi"><div class="lbl">Bénéfice net · Marge ${marge}%</div><div class="val hl">${profit.toLocaleString('fr-FR')} F</div></div>
</div>
<h2>Synthèse mensuelle</h2>
<table><thead><tr><th>Mois</th><th>CA</th><th>Dépenses</th><th>Bénéfice</th><th>Marge</th></tr></thead>
<tbody>${monthRows}</tbody></table>
<h2>Transactions (${transactions.length})</h2>
<table><thead><tr><th>Date</th><th>Libellé</th><th>Type</th><th>Montant</th></tr></thead>
<tbody>${txRows}</tbody></table>
<div class="footer">ZenSpa ERP · Rapport généré automatiquement</div>
<script>window.onload=()=>window.print()</script>
</body></html>`

    const w = window.open('', '_blank')
    if (!w) { alert('Autorisez les pop-ups pour exporter en PDF'); return }
    w.document.write(html)
    w.document.close()
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 rounded-md border border-stone-200 px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-50 cursor-pointer transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
        Exporter
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-40 rounded-md border border-stone-200 bg-white py-1 shadow-lg">
          <button onClick={handleCSV} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-stone-50 cursor-pointer">
            <Download className="h-3.5 w-3.5 text-stone-400" />
            Export CSV
          </button>
          <button onClick={handlePDF} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-stone-50 cursor-pointer">
            <FileText className="h-3.5 w-3.5 text-stone-400" />
            Export PDF
          </button>
        </div>
      )}
    </div>
  )
}
