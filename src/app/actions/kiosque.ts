'use server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export interface KiosqueItem {
  service_name: string
  category:     string
  duration:     number
  price:        number
  qty:          number
}

export interface KiosqueOrder {
  spa_id:       string
  client_name:  string
  client_phone: string
  items:        KiosqueItem[]
  total:        number
  date:         string        // ISO date YYYY-MM-DD
  time:         string | null // HH:MM or null (kiosk without time selection)
  staff_name:   string
  staff_id:     string
}

export async function submitKiosqueOrder(
  order: KiosqueOrder
): Promise<{ success: boolean; error?: string }> {
  if (!order.client_name?.trim() || !order.client_phone?.trim()) {
    return { success: false, error: 'Nom et téléphone requis' }
  }
  if (!order.items.length) {
    return { success: false, error: 'Aucune prestation sélectionnée' }
  }

  // Create one appointment row per (item × qty), all same date/time/therapist
  let currentTime = order.time
  const rows = order.items.flatMap(item =>
    Array.from({ length: item.qty }, () => {
      const row = {
        spa_id:       order.spa_id,
        client_name:  order.client_name.trim(),
        staff_name:   order.staff_name,
        staff_id:     order.staff_id || null,
        service_name: item.service_name,
        date:         order.date,
        time:         currentTime,
        duration:     item.duration,
        price:        item.price,
        status:       'pending',
        notes:        `Borne kiosque | Tel: ${order.client_phone.trim()} | Total: ${order.total.toLocaleString('fr-FR')} F`,
      }
      // Offset start time for next service in sequence (skip if no time)
      if (currentTime) {
        const [h, m] = currentTime.split(':').map(Number)
        const totalMin = h * 60 + m + item.duration
        currentTime = `${String(Math.floor(totalMin / 60)).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`
      }
      return row
    })
  )

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey':        SERVICE_KEY,
        'Prefer':        'return=minimal',
      },
      body: JSON.stringify(rows),
    })
    if (!res.ok) {
      const msg = await res.text()
      console.error('kiosque insert error:', msg)
      return { success: false, error: "Erreur lors de l'envoi" }
    }
    return { success: true }
  } catch {
    return { success: false, error: 'Erreur de connexion' }
  }
}
