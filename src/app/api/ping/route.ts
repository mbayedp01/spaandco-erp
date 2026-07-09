import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey     = process.env.NEXT_PUBLIC_ANON_KEY!

    const res = await fetch(
      `${supabaseUrl}/rest/v1/establishments?select=id&limit=1`,
      {
        headers: {
          apikey:        anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        cache: 'no-store',
      }
    )

    if (!res.ok) throw new Error(`Supabase ${res.status}`)
    return NextResponse.json({ ok: true, ts: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
