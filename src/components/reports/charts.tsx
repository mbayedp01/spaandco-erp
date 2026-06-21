'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts'
import { revenueByMonth, topServices, staffPerformance } from '@/lib/mock-data'

const PIE_COLORS = ['#0D9488', '#14B8A6', '#5EEAD4', '#F59E0B', '#CBD5E1']

function fmt(v: number) {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`
  return String(v)
}

export function RevenueAreaChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={revenueByMonth} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="ca" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0D9488" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="dep" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip
          formatter={(v: number, name: string) => [`${v.toLocaleString('fr-FR')} F`, name === 'ca' ? 'CA' : 'Dépenses']}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e7e5e4' }}
        />
        <Area type="monotone" dataKey="ca" stroke="#0D9488" strokeWidth={2} fill="url(#ca)" name="ca" />
        <Area type="monotone" dataKey="depenses" stroke="#F59E0B" strokeWidth={2} fill="url(#dep)" name="depenses" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function ServicesPieChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={topServices}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {topServices.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => [`${v}%`, 'Part']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(v) => <span style={{ fontSize: 11, color: '#64748b' }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function StaffBarChart() {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={staffPerformance} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tickFormatter={(v) => `${v}`} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={90} />
        <Tooltip formatter={(v: number) => [`${v} RDV`, 'Rendez-vous']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Bar dataKey="rdv" fill="#0D9488" radius={[0, 4, 4, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  )
}
