export interface LineItem {
  name: string
  price: number | null
  qty: number
  performers: string[]
}

export function splitClientLabel(raw: string | null): { client: string; designation: string } {
  if (!raw) return { client: '', designation: '—' }
  const sep = raw.indexOf(' — ')
  if (sep === -1) return { client: '', designation: raw }
  return { client: raw.slice(0, sep), designation: raw.slice(sep + 3) }
}

// Transactions saved before line_items existed only carry "Client — A + B ×2" in their label.
export function legacyLines(label: string | null): { name: string; qty: number }[] {
  return splitClientLabel(label).designation
    .split(' + ')
    .map(s => s.trim())
    .filter(Boolean)
    .map(part => {
      const m = part.match(/^(.*?)\s*×(\d+)$/)
      return m ? { name: m[1], qty: Number(m[2]) } : { name: part, qty: 1 }
    })
}
