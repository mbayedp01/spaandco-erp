/**
 * Données statiques de démonstration pour ZenSpa ERP.
 * Remplaceront les appels Supabase une fois la BDD en ligne.
 */

export type KpiTrend = 'up' | 'down'

export interface Kpi {
  label: string
  value: string
  delta: string
  trend: KpiTrend
  spark: number[]
}

export const kpis: Kpi[] = [
  {
    label: "Chiffre d'affaires (jour)",
    value: '485 000 F',
    delta: '+12%',
    trend: 'up',
    spark: [12, 18, 14, 22, 19, 28, 31],
  },
  {
    label: 'Rendez-vous du jour',
    value: '18',
    delta: '+3',
    trend: 'up',
    spark: [8, 10, 9, 12, 11, 15, 18],
  },
  {
    label: 'Nouveaux clients',
    value: '7',
    delta: '+2',
    trend: 'up',
    spark: [2, 3, 2, 4, 3, 5, 7],
  },
  {
    label: 'Taux de fidélisation',
    value: '82%',
    delta: '-1%',
    trend: 'down',
    spark: [80, 84, 83, 85, 84, 83, 82],
  },
]

export const revenueByMonth = [
  { month: 'Jan', ca: 2100000, depenses: 1200000 },
  { month: 'Fév', ca: 2400000, depenses: 1250000 },
  { month: 'Mar', ca: 2200000, depenses: 1300000 },
  { month: 'Avr', ca: 2800000, depenses: 1400000 },
  { month: 'Mai', ca: 3100000, depenses: 1500000 },
  { month: 'Juin', ca: 3450000, depenses: 1550000 },
]

export const topServices = [
  { name: 'Massage suédois', value: 32 },
  { name: 'Soin hydratant visage', value: 24 },
  { name: 'Pierres chaudes', value: 19 },
  { name: 'Gommage corps', value: 15 },
  { name: 'Autres', value: 10 },
]

export interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  loyaltyPoints: number
  isVip: boolean
  lastVisit: string
}

export const clients: Client[] = [
  { id: '1', firstName: 'Aïssatou', lastName: 'Diop', email: 'aissatou.diop@example.com', phone: '+221 77 111 22 33', loyaltyPoints: 120, isVip: true, lastVisit: '2026-06-15' },
  { id: '2', firstName: 'Moussa', lastName: 'Fall', email: 'moussa.fall@example.com', phone: '+221 77 222 33 44', loyaltyPoints: 40, isVip: false, lastVisit: '2026-06-12' },
  { id: '3', firstName: 'Fatou', lastName: 'Ndiaye', email: 'fatou.ndiaye@example.com', phone: '+221 77 333 44 55', loyaltyPoints: 0, isVip: false, lastVisit: '2026-06-10' },
  { id: '4', firstName: 'Cheikh', lastName: 'Sarr', email: 'cheikh.sarr@example.com', phone: '+221 77 444 55 66', loyaltyPoints: 210, isVip: true, lastVisit: '2026-06-17' },
  { id: '5', firstName: 'Mariama', lastName: 'Bâ', email: 'mariama.ba@example.com', phone: '+221 77 555 66 77', loyaltyPoints: 65, isVip: false, lastVisit: '2026-06-08' },
  { id: '6', firstName: 'Ousmane', lastName: 'Gueye', email: 'ousmane.gueye@example.com', phone: '+221 77 666 77 88', loyaltyPoints: 90, isVip: false, lastVisit: '2026-06-14' },
]

export interface Appointment {
  id: string
  client: string
  service: string
  therapist: string
  time: string
  duration: number
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  price: number
}

export const appointments: Appointment[] = [
  { id: '1', client: 'Aïssatou Diop', service: 'Massage suédois', therapist: 'Awa Sow', time: '09:00', duration: 60, status: 'confirmed', price: 25000 },
  { id: '2', client: 'Cheikh Sarr', service: 'Pierres chaudes', therapist: 'Awa Sow', time: '10:30', duration: 90, status: 'confirmed', price: 35000 },
  { id: '3', client: 'Fatou Ndiaye', service: 'Soin hydratant visage', therapist: 'Bineta Kane', time: '11:00', duration: 45, status: 'pending', price: 18000 },
  { id: '4', client: 'Moussa Fall', service: 'Gommage corps', therapist: 'Bineta Kane', time: '14:00', duration: 50, status: 'confirmed', price: 20000 },
  { id: '5', client: 'Mariama Bâ', service: 'Massage suédois', therapist: 'Awa Sow', time: '15:30', duration: 60, status: 'completed', price: 25000 },
  { id: '6', client: 'Ousmane Gueye', service: 'Soin hydratant visage', therapist: 'Bineta Kane', time: '16:30', duration: 45, status: 'cancelled', price: 18000 },
]

export interface Service {
  id: string
  name: string
  category: string
  duration: number
  price: number
  active: boolean
}

export const services: Service[] = [
  { id: '1', name: 'Massage suédois', category: 'Massages', duration: 60, price: 25000, active: true },
  { id: '2', name: 'Massage aux pierres chaudes', category: 'Massages', duration: 90, price: 35000, active: true },
  { id: '3', name: 'Soin hydratant visage', category: 'Soins du visage', duration: 45, price: 18000, active: true },
  { id: '4', name: 'Gommage corps', category: 'Soins corps', duration: 50, price: 20000, active: true },
  { id: '5', name: 'Enveloppement aux algues', category: 'Soins corps', duration: 60, price: 28000, active: false },
]
