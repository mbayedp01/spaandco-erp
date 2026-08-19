import { createServerClient } from '@/lib/supabase/server'

const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

export interface ReportData {
  totalRevenue: number
  totalExpenses: number
  profit: number
  margin: number
  txCount: number
  avgTicket: number
  monthlyData: { month: string; ca: number; depenses: number }[]
  topServices: { name: string; value: number }[]
  topPerformers: { name: string; ca: number; count: number }[]
  paymentMethods: { name: string; value: number }[]
  dailyData: { date: string; ca: number; depenses: number }[]
}

export async function getReportData(
  spaId: string | null,
  dateFrom: string,
  dateTo: string,
): Promise<ReportData> {
  const supabase = createServerClient()

  let query = (supabase.from('cash_transactions') as any)
    .select('date, amount, type, label, category, payment_method, performed_by')
    .gte('date', dateFrom)
    .lte('date', dateTo)
    .order('date', { ascending: true })

  if (spaId) query = query.eq('spa_id', spaId)

  const { data, error } = await query
  if (error) {
    console.error('getReportData error:', error.message)
    return empty()
  }

  const txs = (data ?? []) as {
    date: string; amount: number; type: string; label: string
    category: string | null; payment_method: string | null; performed_by: string[] | null
  }[]

  const recettes = txs.filter(t => t.type === 'recette')
  const charges  = txs.filter(t => t.type === 'charge')

  const totalRevenue  = recettes.reduce((s, t) => s + t.amount, 0)
  const totalExpenses = charges.reduce((s, t) => s + t.amount, 0)
  const profit = totalRevenue - totalExpenses
  const margin = totalRevenue > 0 ? Math.round((profit / totalRevenue) * 100) : 0
  const avgTicket = recettes.length > 0 ? Math.round(totalRevenue / recettes.length) : 0

  // Monthly aggregation
  const monthMap = new Map<string, { ca: number; depenses: number }>()
  for (const tx of txs) {
    const key = tx.date.substring(0, 7)
    const entry = monthMap.get(key) ?? { ca: 0, depenses: 0 }
    if (tx.type === 'recette') entry.ca += tx.amount
    else entry.depenses += tx.amount
    monthMap.set(key, entry)
  }
  const monthlyData = Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, val]) => {
      const mo = parseInt(key.split('-')[1]) - 1
      return { month: MONTHS_FR[mo] + ' ' + key.split('-')[0].slice(2), ca: val.ca, depenses: val.depenses }
    })

  // Daily aggregation
  const dayMap = new Map<string, { ca: number; depenses: number }>()
  for (const tx of txs) {
    const entry = dayMap.get(tx.date) ?? { ca: 0, depenses: 0 }
    if (tx.type === 'recette') entry.ca += tx.amount
    else entry.depenses += tx.amount
    dayMap.set(tx.date, entry)
  }
  const dailyData = Array.from(dayMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, val]) => ({ date, ...val }))

  // Top services (from label — first part before " — ")
  const svcMap = new Map<string, number>()
  for (const tx of recettes) {
    const name = tx.category || tx.label.split(' — ')[0] || tx.label
    svcMap.set(name, (svcMap.get(name) ?? 0) + tx.amount)
  }
  const svcTotal = totalRevenue || 1
  const topServices = Array.from(svcMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, amount]) => ({ name, value: Math.round((amount / svcTotal) * 100) }))

  // Top performers
  const perfMap = new Map<string, { ca: number; count: number }>()
  for (const tx of recettes) {
    const people = (tx.performed_by ?? []).filter(Boolean)
    if (people.length === 0) continue
    const share = tx.amount / people.length
    for (const name of people) {
      const entry = perfMap.get(name) ?? { ca: 0, count: 0 }
      entry.ca += share
      entry.count += 1
      perfMap.set(name, entry)
    }
  }
  const topPerformers = Array.from(perfMap.entries())
    .map(([name, v]) => ({ name, ca: Math.round(v.ca), count: v.count }))
    .sort((a, b) => b.ca - a.ca)

  // Payment methods
  const pmMap = new Map<string, number>()
  for (const tx of recettes) {
    const method = tx.payment_method || 'Autre'
    pmMap.set(method, (pmMap.get(method) ?? 0) + tx.amount)
  }
  const paymentMethods = Array.from(pmMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))

  return {
    totalRevenue, totalExpenses, profit, margin,
    txCount: recettes.length, avgTicket,
    monthlyData, topServices, topPerformers, paymentMethods, dailyData,
  }
}

function empty(): ReportData {
  return {
    totalRevenue: 0, totalExpenses: 0, profit: 0, margin: 0,
    txCount: 0, avgTicket: 0,
    monthlyData: [], topServices: [], topPerformers: [], paymentMethods: [], dailyData: [],
  }
}
