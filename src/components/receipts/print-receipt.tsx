'use client'

import { useState } from 'react'
import { Printer, Receipt, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

type Format = 'ticket' | 'a4'

export interface ReceiptTransaction {
  id: string
  label: string | null
  category: string | null
  amount: number
  type: string
  payment_method: string | null
  date: string
}

export interface ReceiptEstablishment {
  name: string
  city: string
  address: string | null
  phone: string | null
}

function parseClientAndLabel(raw: string | null): { client: string; designation: string } {
  if (!raw) return { client: '', designation: '—' }
  const sep = raw.indexOf(' — ')
  if (sep === -1) return { client: '', designation: raw }
  return { client: raw.slice(0, sep), designation: raw.slice(sep + 3) }
}

// ─── HTML generators ────────────────────────────────────────────────────────

function ticketHtml(t: ReceiptTransaction, spa: ReceiptEstablishment, clientName?: string): string {
  const dateStr = new Date(t.date).toLocaleDateString('fr-FR')
  const ref = `TK-${t.id.slice(0, 8).toUpperCase()}`
  const { client, designation } = parseClientAndLabel(t.label)
  const displayClient = clientName || client

  return `<!DOCTYPE html><html><head>
<meta charset="UTF-8"><title>Reçu ${ref}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Courier New',monospace; font-size:11px; color:#000; width:80mm; padding:5mm; }
  .c { text-align:center; }
  .b { font-weight:bold; }
  .lg { font-size:15px; }
  .sep { border-top:1px dashed #000; margin:3mm 0; }
  .line { border-top:1px solid #000; margin:3mm 0; }
  .row { display:flex; justify-content:space-between; margin:1.2mm 0; }
  .total { display:flex; justify-content:space-between; font-size:14px; font-weight:bold; margin:2mm 0; }
  .foot { margin-top:6mm; text-align:center; font-size:10px; }
</style></head><body>
<div class="c b lg">✦ ${spa.name.toUpperCase()} ✦</div>
<div class="c">Bien-être &amp; Relaxation</div>
<div class="c">${spa.address ? spa.address + ', ' : ''}${spa.city}</div>
${spa.phone ? `<div class="c">Tél: ${spa.phone}</div>` : ''}
<div class="sep"></div>
<div class="row"><span>Reçu N°</span><span class="b">${ref}</span></div>
<div class="row"><span>Date</span><span>${dateStr}</span></div>
${displayClient ? `<div class="row"><span>Client</span><span class="b">${displayClient}</span></div>` : ''}
<div class="sep"></div>
<div class="row"><span class="b">${designation}</span><span class="b">${t.amount.toLocaleString('fr-FR')} F</span></div>
${t.category ? `<div class="row"><span style="color:#555">Catégorie</span><span>${t.category}</span></div>` : ''}
${t.payment_method ? `<div class="row"><span>Paiement</span><span>${t.payment_method}</span></div>` : ''}
<div class="line"></div>
<div class="total"><span>TOTAL</span><span>${t.amount.toLocaleString('fr-FR')} FCFA</span></div>
<div class="sep"></div>
<div class="foot"><div class="b">Merci pour votre visite !</div><div>À bientôt chez ${spa.name}</div></div>
</body></html>`
}

function a4Html(t: ReceiptTransaction, spa: ReceiptEstablishment, clientName?: string): string {
  const dateStr = new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const ref = `RC-${t.id.slice(0, 8).toUpperCase()}`
  const isRec = t.type === 'recette'
  const amtColor = isRec ? '#15803d' : '#dc2626'
  const badgeBg = isRec ? '#dcfce7' : '#fee2e2'
  const badgeColor = isRec ? '#166534' : '#991b1b'
  const typLabel = isRec ? 'Encaissement' : 'Dépense'
  const { client, designation } = parseClientAndLabel(t.label)
  const displayClient = clientName || client

  return `<!DOCTYPE html><html><head>
<meta charset="UTF-8"><title>Facture ${ref}</title>
<style>
  @page { size: A4; margin: 18mm 22mm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Arial,sans-serif; font-size:12px; color:#1a1a2e; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8mm; }
  .logo { font-size:24px; font-weight:800; color:#0F172A; letter-spacing:1px; }
  .logo-sub { font-size:12px; color:#64748b; margin-top:1mm; }
  .logo-icon { font-size:22px; color:#0D9488; margin-bottom:1.5mm; }
  .spa-info { text-align:right; font-size:11px; color:#475569; line-height:1.7; }
  .spa-info strong { display:block; font-size:13px; color:#0F172A; }
  .divider { border-top:2.5px solid #0D9488; margin:6mm 0 5mm; }
  .divider-sm { border-top:1px solid #e2e8f0; margin:4mm 0; }
  .title { font-size:20px; font-weight:700; color:#0F172A; }
  .subtitle { font-size:11px; color:#94a3b8; margin-top:1mm; }
  .client-box { background:#f8fafc; border-left:3px solid #0D9488; padding:3mm 4mm; margin:5mm 0; border-radius:0 2mm 2mm 0; }
  .client-box label { font-size:9.5px; text-transform:uppercase; letter-spacing:.6px; color:#94a3b8; display:block; margin-bottom:1mm; }
  .client-box .val { font-size:14px; font-weight:700; color:#0F172A; }
  .meta { display:grid; grid-template-columns:1fr 1fr; gap:3mm 8mm; margin:5mm 0; }
  .meta-item label { font-size:9.5px; text-transform:uppercase; letter-spacing:.6px; color:#94a3b8; display:block; margin-bottom:.5mm; }
  .meta-item .val { font-size:13px; font-weight:600; color:#1e293b; }
  .badge { display:inline-block; padding:1mm 2.5mm; border-radius:3mm; font-size:10px; font-weight:700; }
  table { width:100%; border-collapse:collapse; margin:4mm 0; }
  thead tr { background:#f8fafc; }
  th { padding:2.5mm 3mm; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:.5px; color:#64748b; border-bottom:1px solid #e2e8f0; }
  td { padding:3.5mm 3mm; border-bottom:1px solid #f1f5f9; }
  .total-box { background:#f0fdfa; border:1px solid #99f6e4; border-radius:2mm; padding:4mm 5mm; margin-top:5mm; display:flex; justify-content:space-between; align-items:center; }
  .total-lbl { font-size:14px; font-weight:700; color:#0F172A; }
  .total-amt { font-size:24px; font-weight:800; color:#0D9488; }
  .footer { margin-top:14mm; display:flex; justify-content:space-between; align-items:flex-end; padding-top:4mm; border-top:1px solid #e2e8f0; }
  .ty { font-size:13px; font-weight:700; color:#0D9488; }
  .ft-sm { font-size:10px; color:#94a3b8; margin-top:1mm; }
</style></head><body>
<div class="header">
  <div>
    <div class="logo-icon">✦</div>
    <div class="logo">${spa.name}</div>
    <div class="logo-sub">Bien-être &amp; Relaxation</div>
  </div>
  <div class="spa-info">
    <strong>${spa.name}</strong>
    ${spa.address ? spa.address + '<br>' : ''}${spa.city}
    ${spa.phone ? '<br>Tél: ' + spa.phone : ''}
  </div>
</div>
<div class="divider"></div>
<div class="title">Facture</div>
<div class="subtitle">Document officiel — ${typLabel}</div>
${displayClient ? `<div class="client-box"><label>Client</label><div class="val">${displayClient}</div></div>` : ''}
<div class="meta">
  <div class="meta-item"><label>Numéro</label><div class="val">${ref}</div></div>
  <div class="meta-item"><label>Date &amp; heure</label><div class="val">${dateStr} à ${timeStr}</div></div>
  <div class="meta-item"><label>Type</label><div class="val"><span class="badge" style="background:${badgeBg};color:${badgeColor}">${typLabel}</span></div></div>
  <div class="meta-item"><label>Mode de paiement</label><div class="val">${t.payment_method ? `<span class="badge" style="background:#e0f2fe;color:#0369a1">${t.payment_method}</span>` : '—'}</div></div>
</div>
<div class="divider-sm"></div>
<table>
  <thead><tr><th>Désignation</th><th>Catégorie</th><th style="text-align:right">Montant</th></tr></thead>
  <tbody><tr>
    <td style="font-weight:700;color:#1e293b">${designation}</td>
    <td style="color:#64748b">${t.category ?? '—'}</td>
    <td style="text-align:right;font-weight:700;color:${amtColor}">${t.amount.toLocaleString('fr-FR')} FCFA</td>
  </tr></tbody>
</table>
<div class="total-box">
  <span class="total-lbl">Total TTC</span>
  <span class="total-amt">${t.amount.toLocaleString('fr-FR')} FCFA</span>
</div>
<div class="footer">
  <div><div class="ty">Merci pour votre confiance !</div><div class="ft-sm">À bientôt chez ${spa.name}</div></div>
  <div style="text-align:right"><div class="ft-sm">Généré le ${new Date().toLocaleDateString('fr-FR')}</div><div class="ft-sm">${spa.name} · ${spa.city}</div></div>
</div>
</body></html>`
}

// ─── Shared print modal UI ────────────────────────────────────────────────────

function PrintModalContent({
  transaction, establishment, clientName, onClose,
}: {
  transaction: ReceiptTransaction
  establishment: ReceiptEstablishment
  clientName?: string
  onClose: () => void
}) {
  const [format, setFormat] = useState<Format>('ticket')
  const { client, designation } = parseClientAndLabel(transaction.label)
  const displayClient = clientName || client

  function doPrint() {
    const html = format === 'ticket'
      ? ticketHtml(transaction, establishment, displayClient)
      : a4Html(transaction, establishment, displayClient)
    const win = window.open('', '_blank', 'width=620,height=750,scrollbars=yes')
    if (!win) { alert('Autorisez les popups pour imprimer.'); return }
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 600)
    onClose()
  }

  return (
    <div className="px-5 pt-3 pb-6">
      <h3 className="text-base font-semibold text-slate-900">Imprimer la facture</h3>
      <p className="mt-0.5 text-sm text-stone-400">Choisissez le format d&apos;impression</p>

      <div className="mt-4 mb-4 grid grid-cols-2 gap-3">
        {([
          { value: 'ticket' as Format, icon: Receipt, label: 'Ticket de caisse', sub: '80mm · Thermique' },
          { value: 'a4'     as Format, icon: FileText, label: 'Facture A4',        sub: 'Document complet' },
        ] as const).map(({ value, icon: Icon, label, sub }) => (
          <button
            key={value}
            onClick={() => setFormat(value)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 text-sm font-medium transition-all cursor-pointer',
              format === value
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50'
            )}
          >
            <Icon className={cn('h-6 w-6', format === value ? 'text-primary-500' : 'text-stone-400')} />
            <span>{label}</span>
            <span className="text-[11px] font-normal text-stone-400">{sub}</span>
          </button>
        ))}
      </div>

      {/* Aperçu */}
      <div className="mb-5 rounded-xl bg-stone-50 px-4 py-3 text-sm space-y-1.5">
        {displayClient && (
          <div className="flex items-center justify-between">
            <span className="text-stone-500">Client</span>
            <span className="font-semibold text-slate-900">{displayClient}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-stone-500">Désignation</span>
          <span className="font-medium text-slate-900 truncate ml-2 max-w-[180px]">{designation || transaction.label || '—'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-stone-500">Montant</span>
          <span className={cn('font-semibold tabular-nums', transaction.type === 'recette' ? 'text-emerald-700' : 'text-rose-700')}>
            {transaction.amount.toLocaleString('fr-FR')} FCFA
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-stone-500">Date</span>
          <span className="text-slate-700">{new Date(transaction.date).toLocaleDateString('fr-FR')}</span>
        </div>
        {transaction.payment_method && (
          <div className="flex items-center justify-between">
            <span className="text-stone-500">Paiement</span>
            <span className="text-slate-700">{transaction.payment_method}</span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 rounded-xl border border-stone-200 py-3 text-sm font-medium text-stone-600 hover:bg-stone-50 cursor-pointer transition-colors">
          Fermer
        </button>
        <button onClick={doPrint} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 cursor-pointer transition-colors">
          <Printer className="h-4 w-4" />
          Imprimer
        </button>
      </div>
    </div>
  )
}

// ─── InvoiceModal — s'ouvre juste après l'enregistrement ────────────────────

export function InvoiceModal({
  transaction, establishment, clientName, onClose,
}: {
  transaction: ReceiptTransaction
  establishment: ReceiptEstablishment
  clientName?: string
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-stone-200" />
        </div>
        <div className="mx-5 mt-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 font-medium">
          ✓ Transaction enregistrée
        </div>
        <PrintModalContent transaction={transaction} establishment={establishment} clientName={clientName} onClose={onClose} />
      </div>
    </div>
  )
}

// ─── PrintReceiptButton (liste des transactions) ──────────────────────────────

export function PrintReceiptButton({ transaction, establishment }: { transaction: ReceiptTransaction; establishment: ReceiptEstablishment }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true) }}
        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
        title="Imprimer le reçu"
      >
        <Printer className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="h-1 w-10 rounded-full bg-stone-200" /></div>
            <PrintModalContent transaction={transaction} establishment={establishment} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
