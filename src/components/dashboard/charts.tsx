'use client'

import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const PIE_COLORS = ['#0D9488', '#14B8A6', '#5EEAD4', '#F59E0B', '#CBD5E1']

export function RevenueChart({ data }: { data: { month: string; ca: number; depenses: number }[] }) {
  const hasData = data.some(d => d.ca > 0 || d.depenses > 0)
  return (
    <ResponsiveContainer width="100%" height={240}>
      {hasData ? (
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="caGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false}
            tickFormatter={(v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)} />
          <Tooltip
            formatter={(v: number) => `${v.toLocaleString('fr-FR')} F`}
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
          <Area type="monotone" dataKey="ca" stroke="#0D9488" strokeWidth={2} fill="url(#caGradient)" name="CA" />
          <Area type="monotone" dataKey="depenses" stroke="#F59E0B" strokeWidth={2} fillOpacity={0} name="Dépenses" />
        </AreaChart>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-stone-400">
          Aucune transaction enregistrée
        </div>
      )}
    </ResponsiveContainer>
  )
}

export function ServicesChart({ data }: { data: { name: string; count: number; percent: number }[] }) {
  if (!data.length) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-stone-400">
        Aucune prestation enregistrée
      </div>
    )
  }
  const pieData = data.map(d => ({ name: d.name, value: d.percent }))
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
          {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
        </Pie>
        <Tooltip
          formatter={(v: number) => `${v}%`}
          contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function MiniSpark({ data, trend }: { data: number[]; trend: 'up' | 'down' }) {
  const chartData = data.map((v, i) => ({ i, v }))
  const color = trend === 'up' ? '#0D9488' : '#F43F5E'
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={color} fillOpacity={0.1} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
