import { createServerClient } from '@/lib/supabase/server'

export interface DashboardStats {
  totalClients: number
  newClientsThisMonth: number
  totalAppointmentsToday: number
  confirmedToday: number
  pendingToday: number
  completedToday: number
  cancelledToday: number
  revenueToday: number
  revenueMonth: number
  prevMonthRevenue: number
  expensesMonth: number
  profit: number
  lowStockCount: number
  outOfStockCount: number
  activeSubscriptions: number
  monthlyData: { month: string; ca: number; depenses: number }[]
  topServices: { name: string; count: number; percent: number }[]
}

const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

const EMPTY: DashboardStats = {
  totalClients: 0, newClientsThisMonth: 0,
  totalAppointmentsToday: 0, confirmedToday: 0, pendingToday: 0,
  completedToday: 0, cancelledToday: 0,
  revenueToday: 0, revenueMonth: 0, prevMonthRevenue: 0, expensesMonth: 0, profit: 0,
  lowStockCount: 0, outOfStockCount: 0, activeSubscriptions: 0,
  monthlyData: [], topServices: [],
}

export async function getDashboardStats(spaId: string | null): Promise<DashboardStats> {
  try {
    const supabase = createServerClient()
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split('T')[0]
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // ── Clients ──────────────────────────────────────────────────────────────
    let qClients = supabase.from('clients').select('id', { count: 'exact', head: true })
    let qNewClients = supabase.from('clients').select('id', { count: 'exact', head: true }).gte('join_date', monthStart)
    // ── Appointments ─────────────────────────────────────────────────────────
    let qTodayRdv = (supabase.from('appointments') as any).select('status').eq('date', today)
    // ── Cash ─────────────────────────────────────────────────────────────────
    let qCash = (supabase.from('cash_transactions') as any).select('date, amount, type').gte('date', sixMonthsAgo)
    // ── Inventory ────────────────────────────────────────────────────────────
    let qInventory = (supabase.from('inventory') as any).select('quantity, min_quantity')
    // ── Top services ─────────────────────────────────────────────────────────
    let qTopSvc = (supabase.from('appointments') as any).select('service_name').gte('date', thirtyDaysAgo).not('service_name', 'is', null)

    if (spaId) {
      qClients    = (qClients    as any).eq('spa_id', spaId)
      qNewClients = (qNewClients as any).eq('spa_id', spaId)
      qTodayRdv   = qTodayRdv.eq('spa_id', spaId)
      qCash       = qCash.eq('spa_id', spaId)
      qInventory  = qInventory.eq('spa_id', spaId)
      qTopSvc     = qTopSvc.eq('spa_id', spaId)
    }

    const [
      { count: totalClients },
      { count: newClientsThisMonth },
      { data: todayRdvData },
      { data: cashData },
      { data: inventoryData },
      { count: activeSubscriptions },
      { data: recentApptsData },
    ] = await Promise.all([
      qClients,
      qNewClients,
      qTodayRdv,
      qCash,
      qInventory,
      supabase.from('memberships').select('id', { count: 'exact', head: true }).eq('status', 'actif'),
      qTopSvc,
    ])

    // ── Appointments stats ────────────────────────────────────────────────────
    const rdv = (todayRdvData as { status: string }[] | null) ?? []
    const confirmedToday  = rdv.filter(a => a.status === 'confirmed').length
    const pendingToday    = rdv.filter(a => a.status === 'pending').length
    const completedToday  = rdv.filter(a => a.status === 'completed').length
    const cancelledToday  = rdv.filter(a => a.status === 'cancelled').length

    // ── Cash stats ────────────────────────────────────────────────────────────
    const cash = (cashData as { date: string; amount: number; type: string }[] | null) ?? []
    const revenueToday    = cash.filter(t => t.date === today && t.type === 'recette').reduce((s, t) => s + t.amount, 0)
    const revenueMonth    = cash.filter(t => t.date >= monthStart && t.type === 'recette').reduce((s, t) => s + t.amount, 0)
    const prevMonthRevenue = cash.filter(t => t.date >= prevMonthStart && t.date < monthStart && t.type === 'recette').reduce((s, t) => s + t.amount, 0)
    const expensesMonth   = cash.filter(t => t.date >= monthStart && t.type === 'charge').reduce((s, t) => s + t.amount, 0)

    // ── Monthly data (last 6 months) ──────────────────────────────────────────
    const monthlyMap = new Map<string, { ca: number; depenses: number }>()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthlyMap.set(key, { ca: 0, depenses: 0 })
    }
    for (const tx of cash) {
      const key = tx.date.substring(0, 7)
      const entry = monthlyMap.get(key)
      if (entry) {
        if (tx.type === 'recette') entry.ca += tx.amount
        else entry.depenses += tx.amount
      }
    }
    const monthlyData = Array.from(monthlyMap.entries()).map(([key, val]) => {
      const mo = parseInt(key.split('-')[1]) - 1
      return { month: MONTHS_FR[mo], ca: val.ca, depenses: val.depenses }
    })

    // ── Inventory ─────────────────────────────────────────────────────────────
    const inv = (inventoryData as { quantity: number; min_quantity: number }[] | null) ?? []
    const lowStockCount  = inv.filter(i => i.quantity > 0 && i.quantity <= i.min_quantity).length
    const outOfStockCount = inv.filter(i => i.quantity === 0).length

    // ── Top services ──────────────────────────────────────────────────────────
    const svcCount = new Map<string, number>()
    for (const appt of (recentApptsData as { service_name: string | null }[] | null) ?? []) {
      if (appt.service_name) svcCount.set(appt.service_name, (svcCount.get(appt.service_name) ?? 0) + 1)
    }
    const totalAppts = (recentApptsData ?? []).length
    const topServices = Array.from(svcCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count, percent: totalAppts > 0 ? Math.round((count / totalAppts) * 100) : 0 }))

    return {
      totalClients:          totalClients ?? 0,
      newClientsThisMonth:   newClientsThisMonth ?? 0,
      totalAppointmentsToday: rdv.length,
      confirmedToday, pendingToday, completedToday, cancelledToday,
      revenueToday, revenueMonth, prevMonthRevenue, expensesMonth,
      profit: revenueMonth - expensesMonth,
      lowStockCount, outOfStockCount,
      activeSubscriptions: activeSubscriptions ?? 0,
      monthlyData, topServices,
    }
  } catch (err) {
    console.error('getDashboardStats:', err)
    return EMPTY
  }
}
