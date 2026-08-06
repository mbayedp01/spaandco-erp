import { KiosqueApp } from './kiosque'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T[]> {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${SERVICE_KEY}`, 'apikey': SERVICE_KEY },
    cache: 'no-store',
  })
  if (!res.ok) return []
  return res.json()
}

export default async function KiosquePage() {
  const today  = new Date().toISOString().split('T')[0]
  const plus7  = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0]

  const [services, staffList, appointments, establishments] = await Promise.all([
    get('services', {
      select: 'id,name,category,description,duration,price,active',
      active: 'eq.true',
      order:  'category.asc,name.asc',
    }),
    get('staff', {
      select: 'id,first_name,last_name,specialty,status,spa_id',
      status: 'eq.active',
    }),
    get('appointments', {
      select: 'date,time,duration,staff_name,staff_id,status,spa_id',
      date:   `gte.${today}`,
      status: 'in.(confirmed,pending)',
      order:  'date.asc,time.asc',
    }),
    get('establishments', {
      select: 'id,name,city',
      status: 'eq.actif',
      order:  'name.asc',
    }),
  ])

  // Supabase doesn't AND two filters on the same column via query params —
  // filter plus7 client-side (only 7 days so it's trivial)
  const nearAppts = (appointments as any[]).filter((a: any) => a.date <= plus7)

  return (
    <main style={{ margin: 0, padding: 0 }}>
      <KiosqueApp
        services={services as any}
        staffList={staffList as any}
        appointments={nearAppts as any}
        establishments={establishments as any}
      />
    </main>
  )
}
