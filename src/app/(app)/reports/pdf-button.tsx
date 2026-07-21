'use client'

import { Download } from 'lucide-react'

interface MonthRow { month: string; ca: number; depenses: number }
interface TopService { name: string; value: number }
interface StaffItem  { name: string; role: string; ca: number; note: number; rdv: number }

interface Props {
  spaName: string
  period: string
  lastMonthCA: number
  profit: number
  margin: number
  caGrowth: number
  topServices: TopService[]
  staffPerformance: StaffItem[]
  monthlyData: MonthRow[]
}

export function ExportReportPDFButton({
  spaName, period, lastMonthCA, profit, margin, caGrowth,
  topServices, staffPerformance, monthlyData,
}: Props) {
  function handleExport() {
    const date = new Date().toLocaleDateString('fr-FR')

    const tableRows = [...monthlyData].reverse().map(m => {
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

    const servicesRows = topServices.map(s =>
      `<div class="row"><span>${s.name}</span><span>${s.value}%</span></div>`
    ).join('')

    const staffRows = staffPerformance.map(s =>
      `<div class="row"><span><b>${s.name}</b> <em>${s.role}</em></span><span class="pos">${s.ca.toLocaleString('fr-FR')} F · ★${s.note} · ${s.rdv} RDV</span></div>`
    ).join('')

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>Rapport — ${spaName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,Arial,sans-serif;font-size:12px;color:#1e293b;padding:28px 32px}
.header{border-bottom:3px solid #0d9488;padding-bottom:14px;margin-bottom:20px}
.header h1{font-size:22px;font-weight:700;color:#0d9488}
.header .meta{color:#64748b;margin-top:4px;font-size:11px}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
.kpi{border:1px solid #e2e8f0;border-radius:8px;padding:12px}
.kpi .lbl{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.5px}
.kpi .val{font-size:18px;font-weight:700;margin-top:4px}
.kpi .sub{font-size:10px;color:#94a3b8;margin-top:2px}
h2{font-size:14px;font-weight:600;margin:16px 0 8px}
table{width:100%;border-collapse:collapse}
th{background:#f8fafc;font-size:10px;font-weight:600;color:#64748b;text-transform:uppercase;padding:8px 10px;text-align:left;border-bottom:2px solid #e2e8f0}
td{padding:7px 10px;border-bottom:1px solid #f1f5f9}
.pos{color:#059669;font-weight:600}
.neg{color:#dc2626}
.hl{color:#0d9488;font-weight:600}
.row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:11px}
.row em{color:#64748b;font-style:normal;margin-left:4px;font-size:10px}
.footer{margin-top:24px;font-size:10px;color:#94a3b8;text-align:right;border-top:1px solid #e2e8f0;padding-top:8px}
@media print{body{padding:16px}}
</style></head><body>
<div class="header">
  <h1>Rapport &amp; Analyses — ${spaName}</h1>
  <div class="meta">Période : ${period} · Exporté le ${date}</div>
</div>
<div class="kpis">
  <div class="kpi"><div class="lbl">CA ce mois</div><div class="val pos">${lastMonthCA.toLocaleString('fr-FR')} F</div><div class="sub">+${caGrowth}% vs mois préc.</div></div>
  <div class="kpi"><div class="lbl">Bénéfice net</div><div class="val hl">${profit.toLocaleString('fr-FR')} F</div><div class="sub">Marge ${margin}%</div></div>
  <div class="kpi"><div class="lbl">Marge nette</div><div class="val">${margin}%</div></div>
  <div class="kpi"><div class="lbl">Croissance CA</div><div class="val ${caGrowth >= 0 ? 'pos' : 'neg'}">${caGrowth >= 0 ? '+' : ''}${caGrowth}%</div></div>
</div>
<h2>Synthèse mensuelle — 12 mois</h2>
<table><thead><tr><th>Mois</th><th>CA</th><th>Dépenses</th><th>Bénéfice</th><th>Marge</th></tr></thead>
<tbody>${tableRows}</tbody></table>
<h2>Top prestations</h2>
<div>${servicesRows}</div>
<h2>Performance thérapeutes</h2>
<div>${staffRows}</div>
<div class="footer">ZenSpa ERP · Rapport généré automatiquement</div>
<script>window.onload=()=>window.print()</script>
</body></html>`

    const w = window.open('', '_blank')
    if (!w) { alert('Autorisez les pop-ups pour exporter'); return }
    w.document.write(html)
    w.document.close()
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-stone-50 cursor-pointer transition-colors"
    >
      <Download className="h-4 w-4" />
      Exporter PDF
    </button>
  )
}
