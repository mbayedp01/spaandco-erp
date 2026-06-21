/**
 * Données statiques de démonstration pour Spa and Co.
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
  { month: 'Juil', ca: 1800000, depenses: 1100000 },
  { month: 'Aoû', ca: 1650000, depenses: 1050000 },
  { month: 'Sep', ca: 2050000, depenses: 1160000 },
  { month: 'Oct', ca: 2300000, depenses: 1210000 },
  { month: 'Nov', ca: 2550000, depenses: 1320000 },
  { month: 'Déc', ca: 2950000, depenses: 1460000 },
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

export const staffPerformance = [
  { name: 'Awa Sow', role: 'Thérapeute', rdv: 52, ca: 1430000, note: 4.9 },
  { name: 'Bineta Kane', role: 'Thérapeute', rdv: 44, ca: 1050000, note: 4.7 },
  { name: 'Rokhaya Diallo', role: 'Esthéticienne', rdv: 38, ca: 760000, note: 4.8 },
  { name: 'Aminata Cissé', role: 'Esthéticienne', rdv: 29, ca: 580000, note: 4.6 },
]

// ─── Clients ──────────────────────────────────────────────────────────────────

export interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  loyaltyPoints: number
  isVip: boolean
  lastVisit: string
  totalSpent: number
  visitsCount: number
  joinDate: string
}

export const clients: Client[] = [
  { id: '1', firstName: 'Aïssatou', lastName: 'Diop', email: 'aissatou.diop@example.com', phone: '+221 77 111 22 33', loyaltyPoints: 120, isVip: true, lastVisit: '2026-06-15', totalSpent: 485000, visitsCount: 18, joinDate: '2024-01-10' },
  { id: '2', firstName: 'Moussa', lastName: 'Fall', email: 'moussa.fall@example.com', phone: '+221 77 222 33 44', loyaltyPoints: 40, isVip: false, lastVisit: '2026-06-12', totalSpent: 125000, visitsCount: 6, joinDate: '2025-03-05' },
  { id: '3', firstName: 'Fatou', lastName: 'Ndiaye', email: 'fatou.ndiaye@example.com', phone: '+221 77 333 44 55', loyaltyPoints: 0, isVip: false, lastVisit: '2026-06-10', totalSpent: 36000, visitsCount: 2, joinDate: '2026-05-20' },
  { id: '4', firstName: 'Cheikh', lastName: 'Sarr', email: 'cheikh.sarr@example.com', phone: '+221 77 444 55 66', loyaltyPoints: 210, isVip: true, lastVisit: '2026-06-17', totalSpent: 720000, visitsCount: 24, joinDate: '2023-11-08' },
  { id: '5', firstName: 'Mariama', lastName: 'Bâ', email: 'mariama.ba@example.com', phone: '+221 77 555 66 77', loyaltyPoints: 65, isVip: false, lastVisit: '2026-06-08', totalSpent: 210000, visitsCount: 9, joinDate: '2024-08-14' },
  { id: '6', firstName: 'Ousmane', lastName: 'Gueye', email: 'ousmane.gueye@example.com', phone: '+221 77 666 77 88', loyaltyPoints: 90, isVip: false, lastVisit: '2026-06-14', totalSpent: 290000, visitsCount: 12, joinDate: '2024-04-22' },
  { id: '7', firstName: 'Rokhaya', lastName: 'Thiaw', email: 'rokhaya.thiaw@example.com', phone: '+221 77 123 45 67', loyaltyPoints: 175, isVip: true, lastVisit: '2026-06-18', totalSpent: 560000, visitsCount: 20, joinDate: '2023-09-01' },
  { id: '8', firstName: 'Ibrahima', lastName: 'Cissé', email: 'ibrahima.cisse@example.com', phone: '+221 77 234 56 78', loyaltyPoints: 30, isVip: false, lastVisit: '2026-05-30', totalSpent: 90000, visitsCount: 4, joinDate: '2025-11-15' },
  { id: '9', firstName: 'Ndèye', lastName: 'Sall', email: 'ndeye.sall@example.com', phone: '+221 77 345 67 89', loyaltyPoints: 55, isVip: false, lastVisit: '2026-06-05', totalSpent: 175000, visitsCount: 7, joinDate: '2025-01-20' },
  { id: '10', firstName: 'Pape', lastName: 'Diallo', email: 'pape.diallo@example.com', phone: '+221 77 456 78 90', loyaltyPoints: 0, isVip: false, lastVisit: '2026-06-18', totalSpent: 25000, visitsCount: 1, joinDate: '2026-06-18' },
  { id: '11', firstName: 'Aminata', lastName: 'Mbaye', email: 'aminata.mbaye@example.com', phone: '+221 77 567 89 01', loyaltyPoints: 145, isVip: true, lastVisit: '2026-06-16', totalSpent: 495000, visitsCount: 16, joinDate: '2024-02-10' },
  { id: '12', firstName: 'Serigne', lastName: 'Niang', email: 'serigne.niang@example.com', phone: '+221 77 678 90 12', loyaltyPoints: 20, isVip: false, lastVisit: '2026-06-01', totalSpent: 60000, visitsCount: 3, joinDate: '2026-03-14' },
  { id: '13', firstName: 'Khady', lastName: 'Diouf', email: 'khady.diouf@example.com', phone: '+221 77 789 01 23', loyaltyPoints: 80, isVip: false, lastVisit: '2026-06-11', totalSpent: 255000, visitsCount: 10, joinDate: '2024-10-05' },
  { id: '14', firstName: 'Mamadou', lastName: 'Traoré', email: 'mamadou.traore@example.com', phone: '+221 77 890 12 34', loyaltyPoints: 235, isVip: true, lastVisit: '2026-06-17', totalSpent: 810000, visitsCount: 28, joinDate: '2023-06-15' },
  { id: '15', firstName: 'Sokhna', lastName: 'Ba', email: 'sokhna.ba@example.com', phone: '+221 77 901 23 45', loyaltyPoints: 60, isVip: false, lastVisit: '2026-06-09', totalSpent: 192000, visitsCount: 8, joinDate: '2025-02-28' },
  { id: '16', firstName: 'Aliou', lastName: 'Kane', email: 'aliou.kane@example.com', phone: '+221 77 012 34 56', loyaltyPoints: 0, isVip: false, lastVisit: '2026-06-17', totalSpent: 35000, visitsCount: 2, joinDate: '2026-06-01' },
  { id: '17', firstName: 'Bintou', lastName: 'Camara', email: 'bintou.camara@example.com', phone: '+221 77 111 22 44', loyaltyPoints: 110, isVip: false, lastVisit: '2026-06-13', totalSpent: 350000, visitsCount: 14, joinDate: '2024-05-12' },
  { id: '18', firstName: 'Modou', lastName: 'Faye', email: 'modou.faye@example.com', phone: '+221 77 222 33 55', loyaltyPoints: 190, isVip: true, lastVisit: '2026-06-16', totalSpent: 640000, visitsCount: 22, joinDate: '2023-12-01' },
  { id: '19', firstName: 'Astou', lastName: 'Dieng', email: 'astou.dieng@example.com', phone: '+221 77 333 44 66', loyaltyPoints: 45, isVip: false, lastVisit: '2026-06-07', totalSpent: 142000, visitsCount: 6, joinDate: '2025-07-19' },
  { id: '20', firstName: 'Lamine', lastName: 'Sy', email: 'lamine.sy@example.com', phone: '+221 77 444 55 77', loyaltyPoints: 0, isVip: false, lastVisit: '2026-06-18', totalSpent: 18000, visitsCount: 1, joinDate: '2026-06-18' },
]

// ─── Rendez-vous ──────────────────────────────────────────────────────────────

export interface Appointment {
  id: string
  client: string
  service: string
  therapist: string
  /** Jour de la semaine : 0 = Lundi … 6 = Dimanche */
  day: number
  time: string
  duration: number
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  price: number
}

export const TODAY_INDEX = 2

export const weekDays = [
  { short: 'Lun', date: 16 },
  { short: 'Mar', date: 17 },
  { short: 'Mer', date: 18 },
  { short: 'Jeu', date: 19 },
  { short: 'Ven', date: 20 },
  { short: 'Sam', date: 21 },
  { short: 'Dim', date: 22 },
]
export const weekLabel = '16 – 22 juin 2026'

export const appointments: Appointment[] = [
  // Lundi
  { id: '1', client: 'Aïssatou Diop', service: 'Massage suédois', therapist: 'Awa Sow', day: 0, time: '09:00', duration: 60, status: 'confirmed', price: 25000 },
  { id: '2', client: 'Cheikh Sarr', service: 'Pierres chaudes', therapist: 'Awa Sow', day: 0, time: '14:00', duration: 90, status: 'confirmed', price: 35000 },
  { id: '17', client: 'Rokhaya Thiaw', service: 'Lifting visage', therapist: 'Rokhaya Diallo', day: 0, time: '10:30', duration: 60, status: 'confirmed', price: 30000 },
  // Mardi
  { id: '3', client: 'Mariama Bâ', service: 'Soin hydratant visage', therapist: 'Bineta Kane', day: 1, time: '10:00', duration: 45, status: 'confirmed', price: 18000 },
  { id: '4', client: 'Moussa Fall', service: 'Gommage corps', therapist: 'Bineta Kane', day: 1, time: '15:30', duration: 50, status: 'pending', price: 20000 },
  { id: '18', client: 'Aminata Mbaye', service: 'Manucure', therapist: 'Rokhaya Diallo', day: 1, time: '09:00', duration: 45, status: 'confirmed', price: 12000 },
  // Mercredi (aujourd'hui)
  { id: '5', client: 'Aïssatou Diop', service: 'Massage suédois', therapist: 'Awa Sow', day: 2, time: '09:00', duration: 60, status: 'confirmed', price: 25000 },
  { id: '6', client: 'Cheikh Sarr', service: 'Pierres chaudes', therapist: 'Awa Sow', day: 2, time: '10:30', duration: 90, status: 'confirmed', price: 35000 },
  { id: '7', client: 'Fatou Ndiaye', service: 'Soin hydratant visage', therapist: 'Bineta Kane', day: 2, time: '11:00', duration: 45, status: 'pending', price: 18000 },
  { id: '8', client: 'Moussa Fall', service: 'Gommage corps', therapist: 'Bineta Kane', day: 2, time: '14:00', duration: 50, status: 'confirmed', price: 20000 },
  { id: '9', client: 'Mariama Bâ', service: 'Massage suédois', therapist: 'Awa Sow', day: 2, time: '15:30', duration: 60, status: 'completed', price: 25000 },
  { id: '10', client: 'Ousmane Gueye', service: 'Soin hydratant visage', therapist: 'Bineta Kane', day: 2, time: '16:30', duration: 45, status: 'cancelled', price: 18000 },
  // Jeudi
  { id: '11', client: 'Ousmane Gueye', service: 'Massage suédois', therapist: 'Awa Sow', day: 3, time: '08:30', duration: 60, status: 'confirmed', price: 25000 },
  { id: '12', client: 'Fatou Ndiaye', service: 'Gommage corps', therapist: 'Bineta Kane', day: 3, time: '13:00', duration: 50, status: 'confirmed', price: 20000 },
  { id: '19', client: 'Mamadou Traoré', service: 'Massage profond', therapist: 'Awa Sow', day: 3, time: '16:00', duration: 75, status: 'confirmed', price: 32000 },
  // Vendredi
  { id: '13', client: 'Cheikh Sarr', service: 'Pierres chaudes', therapist: 'Awa Sow', day: 4, time: '09:00', duration: 90, status: 'confirmed', price: 35000 },
  { id: '14', client: 'Aïssatou Diop', service: 'Soin hydratant visage', therapist: 'Bineta Kane', day: 4, time: '16:00', duration: 45, status: 'pending', price: 18000 },
  { id: '20', client: 'Modou Faye', service: 'Soin anti-âge', therapist: 'Rokhaya Diallo', day: 4, time: '11:00', duration: 60, status: 'confirmed', price: 38000 },
  // Samedi
  { id: '15', client: 'Mariama Bâ', service: 'Massage suédois', therapist: 'Awa Sow', day: 5, time: '10:00', duration: 60, status: 'confirmed', price: 25000 },
  { id: '16', client: 'Moussa Fall', service: 'Pierres chaudes', therapist: 'Awa Sow', day: 5, time: '11:30', duration: 90, status: 'confirmed', price: 35000 },
  { id: '21', client: 'Bintou Camara', service: 'Pédicure', therapist: 'Rokhaya Diallo', day: 5, time: '09:00', duration: 45, status: 'confirmed', price: 12000 },
]

export const todayAppointments = appointments.filter((a) => a.day === TODAY_INDEX)

// ─── Personnel ────────────────────────────────────────────────────────────────

export interface StaffMember {
  id: string
  firstName: string
  lastName: string
  role: 'Thérapeute' | 'Réceptionniste' | 'Manager' | 'Esthéticienne'
  specialty: string
  phone: string
  email: string
  status: 'active' | 'absent' | 'conge'
  startDate: string
  salary: number
  rdvCount: number
}

export const staff: StaffMember[] = [
  { id: '1', firstName: 'Awa', lastName: 'Sow', role: 'Thérapeute', specialty: 'Massages corps & pierres', phone: '+221 77 100 11 22', email: 'awa.sow@spaandco.sn', status: 'active', startDate: '2024-01-15', salary: 280000, rdvCount: 8 },
  { id: '2', firstName: 'Bineta', lastName: 'Kane', role: 'Thérapeute', specialty: 'Soins visage & corps', phone: '+221 77 200 22 33', email: 'bineta.kane@spaandco.sn', status: 'active', startDate: '2024-03-01', salary: 260000, rdvCount: 6 },
  { id: '3', firstName: 'Rokhaya', lastName: 'Diallo', role: 'Esthéticienne', specialty: 'Beauté ongles & cils', phone: '+221 77 300 33 44', email: 'rokhaya.diallo@spaandco.sn', status: 'active', startDate: '2023-11-20', salary: 240000, rdvCount: 4 },
  { id: '4', firstName: 'Ndèye', lastName: 'Mbaye', role: 'Réceptionniste', specialty: 'Accueil & planification', phone: '+221 77 400 44 55', email: 'ndeye.mbaye@spaandco.sn', status: 'absent', startDate: '2024-06-01', salary: 180000, rdvCount: 0 },
  { id: '5', firstName: 'Ibrahima', lastName: 'Seck', role: 'Manager', specialty: 'Direction générale', phone: '+221 77 500 55 66', email: 'ibrahima.seck@spaandco.sn', status: 'active', startDate: '2023-05-10', salary: 450000, rdvCount: 0 },
  { id: '6', firstName: 'Aminata', lastName: 'Cissé', role: 'Esthéticienne', specialty: 'Soins visage & peeling', phone: '+221 77 600 66 77', email: 'aminata.cisse@spaandco.sn', status: 'conge', startDate: '2025-01-08', salary: 230000, rdvCount: 0 },
  { id: '7', firstName: 'Coumba', lastName: 'Ndiaye', role: 'Thérapeute', specialty: 'Massage bien-être & ayurvéda', phone: '+221 77 700 77 88', email: 'coumba.ndiaye@spaandco.sn', status: 'active', startDate: '2025-04-15', salary: 250000, rdvCount: 3 },
  { id: '8', firstName: 'Fatima', lastName: 'Ly', role: 'Réceptionniste', specialty: 'Caisse & facturation', phone: '+221 77 800 88 99', email: 'fatima.ly@spaandco.sn', status: 'active', startDate: '2025-09-01', salary: 175000, rdvCount: 0 },
]

// ─── Stocks ───────────────────────────────────────────────────────────────────

export interface InventoryItem {
  id: string
  name: string
  category: string
  stock: number
  minStock: number
  unit: string
  price: number
  supplier: string
}

export const inventory: InventoryItem[] = [
  { id: '1', name: 'Huile de massage argan', category: 'Huiles', stock: 24, minStock: 10, unit: 'bouteille', price: 8500, supplier: 'NaturaBio SN' },
  { id: '2', name: 'Huile essentielle lavande', category: 'Huiles', stock: 8, minStock: 10, unit: 'flacon', price: 6000, supplier: 'NaturaBio SN' },
  { id: '3', name: 'Huile de coco vierge', category: 'Huiles', stock: 18, minStock: 8, unit: 'pot', price: 5500, supplier: 'NaturaBio SN' },
  { id: '4', name: 'Gommage au sel marin', category: 'Soins corps', stock: 15, minStock: 5, unit: 'pot', price: 4500, supplier: 'Beauté Dakar' },
  { id: '5', name: 'Crème hydratante visage', category: 'Soins visage', stock: 3, minStock: 8, unit: 'tube', price: 12000, supplier: 'DermoSpa' },
  { id: '6', name: 'Sérum anti-âge', category: 'Soins visage', stock: 5, minStock: 6, unit: 'flacon', price: 22000, supplier: 'DermoSpa' },
  { id: '7', name: 'Masque purifiant argile', category: 'Soins visage', stock: 11, minStock: 5, unit: 'tube', price: 9000, supplier: 'DermoSpa' },
  { id: '8', name: 'Pierres basalte (set)', category: 'Équipement', stock: 6, minStock: 3, unit: 'set', price: 45000, supplier: 'ProSpa Import' },
  { id: '9', name: 'Table de massage', category: 'Équipement', stock: 4, minStock: 2, unit: 'pièce', price: 320000, supplier: 'ProSpa Import' },
  { id: '10', name: 'Serviettes coton', category: 'Linge', stock: 42, minStock: 20, unit: 'pièce', price: 3500, supplier: 'Textile Sénégal' },
  { id: '11', name: 'Peignoirs', category: 'Linge', stock: 12, minStock: 8, unit: 'pièce', price: 8500, supplier: 'Textile Sénégal' },
  { id: '12', name: 'Algues marines', category: 'Soins corps', stock: 2, minStock: 5, unit: 'kg', price: 18000, supplier: 'NaturaBio SN' },
  { id: '13', name: 'Chocolat de massage', category: 'Soins corps', stock: 7, minStock: 4, unit: 'pot', price: 14000, supplier: 'Beauté Dakar' },
  { id: '14', name: 'Bougies massage', category: 'Accessoires', stock: 18, minStock: 10, unit: 'pièce', price: 5000, supplier: 'Beauté Dakar' },
  { id: '15', name: 'Vernis semi-permanent', category: 'Beauté', stock: 30, minStock: 15, unit: 'flacon', price: 4500, supplier: 'BeautyPro' },
  { id: '16', name: 'Gel de soin ongles', category: 'Beauté', stock: 4, minStock: 6, unit: 'tube', price: 7500, supplier: 'BeautyPro' },
]

// ─── Caisse ───────────────────────────────────────────────────────────────────

export interface CashTransaction {
  id: string
  time: string
  label: string
  type: 'encaissement' | 'depense'
  amount: number
  method: 'Espèces' | 'Carte' | 'Mobile Money'
}

export const cashTransactions: CashTransaction[] = [
  { id: '1', time: '09:15', label: 'Massage suédois — Aïssatou Diop', type: 'encaissement', amount: 25000, method: 'Carte' },
  { id: '2', time: '10:45', label: 'Pierres chaudes — Cheikh Sarr', type: 'encaissement', amount: 35000, method: 'Mobile Money' },
  { id: '3', time: '11:20', label: 'Achat huiles essentielles', type: 'depense', amount: 18000, method: 'Espèces' },
  { id: '4', time: '11:55', label: 'Soin visage — Fatou Ndiaye', type: 'encaissement', amount: 18000, method: 'Espèces' },
  { id: '5', time: '12:30', label: 'Gommage corps — Moussa Fall', type: 'encaissement', amount: 20000, method: 'Carte' },
  { id: '6', time: '13:00', label: 'Repas personnel', type: 'depense', amount: 15000, method: 'Espèces' },
  { id: '7', time: '14:00', label: 'Fournitures nettoyage', type: 'depense', amount: 7500, method: 'Espèces' },
  { id: '8', time: '14:30', label: 'Massage suédois — Mariama Bâ', type: 'encaissement', amount: 25000, method: 'Mobile Money' },
  { id: '9', time: '15:00', label: 'Lifting visage — Rokhaya Thiaw', type: 'encaissement', amount: 30000, method: 'Carte' },
  { id: '10', time: '15:45', label: 'Pierres chaudes — Mamadou Traoré', type: 'encaissement', amount: 35000, method: 'Mobile Money' },
  { id: '11', time: '16:00', label: 'Vernis semi-permanent — Astou Dieng', type: 'encaissement', amount: 12000, method: 'Espèces' },
  { id: '12', time: '16:30', label: 'Achat produits cosmétiques', type: 'depense', amount: 32000, method: 'Carte' },
  { id: '13', time: '17:00', label: 'Massage dos — Aliou Kane', type: 'encaissement', amount: 20000, method: 'Mobile Money' },
  { id: '14', time: '17:45', label: 'Soin anti-âge — Modou Faye', type: 'encaissement', amount: 38000, method: 'Carte' },
  { id: '15', time: '18:30', label: 'Pédicure — Bintou Camara', type: 'encaissement', amount: 12000, method: 'Espèces' },
]

// ─── Marketing ────────────────────────────────────────────────────────────────

export interface MarketingCampaign {
  id: string
  name: string
  type: 'SMS' | 'Email' | 'Promo'
  target: string
  sent: number
  opened: number
  status: 'active' | 'terminee' | 'brouillon'
  date: string
}

export const campaigns: MarketingCampaign[] = [
  { id: '1', name: 'Offre été 2026', type: 'Email', target: 'Tous les clients', sent: 248, opened: 112, status: 'active', date: '2026-06-10' },
  { id: '2', name: 'Rappel RDV semaine', type: 'SMS', target: 'RDV cette semaine', sent: 18, opened: 18, status: 'active', date: '2026-06-16' },
  { id: '3', name: 'Programme fidélité VIP', type: 'Email', target: 'Clients VIP', sent: 32, opened: 28, status: 'terminee', date: '2026-05-20' },
  { id: '4', name: 'Promo massage -20%', type: 'Promo', target: 'Nouveaux clients', sent: 0, opened: 0, status: 'brouillon', date: '2026-06-25' },
  { id: '5', name: 'Réactivation clients', type: 'Email', target: 'Inactifs > 60 jours', sent: 45, opened: 19, status: 'terminee', date: '2026-05-05' },
  { id: '6', name: 'Anniversaire clients', type: 'SMS', target: 'Anniversaires ce mois', sent: 7, opened: 7, status: 'active', date: '2026-06-01' },
]

// ─── Fournisseurs ─────────────────────────────────────────────────────────────

export interface Supplier {
  id: string
  name: string
  category: string
  contact: string
  phone: string
  email: string
  monthlySend: number
  lastOrder: string
  status: 'actif' | 'inactif'
  pendingOrders: number
}

export const suppliers: Supplier[] = [
  { id: '1', name: 'NaturaBio SN', category: 'Huiles & Produits naturels', contact: 'Cheikh Ly', phone: '+221 33 820 11 22', email: 'commandes@naturabio.sn', monthlySend: 185000, lastOrder: '2026-06-10', status: 'actif', pendingOrders: 1 },
  { id: '2', name: 'DermoSpa', category: 'Soins visage & corps', contact: 'Fatou Sow', phone: '+221 33 821 22 33', email: 'info@dermospa.sn', monthlySend: 245000, lastOrder: '2026-06-05', status: 'actif', pendingOrders: 0 },
  { id: '3', name: 'Beauté Dakar', category: 'Soins corps & Accessoires', contact: 'Moussa Niang', phone: '+221 77 930 33 44', email: 'commandes@beautedakar.sn', monthlySend: 120000, lastOrder: '2026-06-12', status: 'actif', pendingOrders: 2 },
  { id: '4', name: 'ProSpa Import', category: 'Équipement professionnel', contact: 'Ibrahima Fall', phone: '+221 33 822 44 55', email: 'pro@prospa-import.sn', monthlySend: 380000, lastOrder: '2026-05-28', status: 'actif', pendingOrders: 0 },
  { id: '5', name: 'Textile Sénégal', category: 'Linge & Textiles', contact: 'Aminata Diallo', phone: '+221 77 940 55 66', email: 'textile@textilesenegal.sn', monthlySend: 95000, lastOrder: '2026-06-08', status: 'actif', pendingOrders: 1 },
  { id: '6', name: 'BeautyPro', category: 'Beauté & Ongles', contact: 'Sophie Martin', phone: '+221 33 823 66 77', email: 'order@beautypro.sn', monthlySend: 68000, lastOrder: '2026-06-14', status: 'actif', pendingOrders: 0 },
  { id: '7', name: 'AromaSen', category: 'Huiles essentielles', contact: 'Rokhaya Mbaye', phone: '+221 77 950 77 88', email: 'aroma@aromasen.sn', monthlySend: 55000, lastOrder: '2026-05-20', status: 'inactif', pendingOrders: 0 },
  { id: '8', name: 'MediSpa Dakar', category: 'Matériel médico-esthétique', contact: 'Dr. Kane', phone: '+221 33 824 88 99', email: 'medispa@medispa.sn', monthlySend: 210000, lastOrder: '2026-06-01', status: 'actif', pendingOrders: 1 },
]

// ─── Abonnements ──────────────────────────────────────────────────────────────

export interface MembershipPlan {
  id: string
  name: string
  color: string
  price: number
  soins: number | 'illimité'
  remise: number
  avantages: string[]
}

export const membershipPlans: MembershipPlan[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    color: 'from-amber-700 to-amber-500',
    price: 45000,
    soins: 1,
    remise: 5,
    avantages: ['1 soin/mois au choix', '5% de remise', 'Rappel RDV SMS'],
  },
  {
    id: 'silver',
    name: 'Silver',
    color: 'from-slate-500 to-slate-400',
    price: 85000,
    soins: 2,
    remise: 10,
    avantages: ['2 soins/mois au choix', '10% de remise', 'Priorité de réservation', 'Rappel RDV SMS'],
  },
  {
    id: 'gold',
    name: 'Gold',
    color: 'from-yellow-600 to-yellow-400',
    price: 120000,
    soins: 3,
    remise: 15,
    avantages: ['3 soins/mois au choix', '15% de remise', 'Accès prioritaire', 'Produit offert/mois'],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    color: 'from-primary-700 to-primary-500',
    price: 200000,
    soins: 'illimité',
    remise: 20,
    avantages: ['Soins illimités', '20% de remise', 'Accès VIP', 'Produits offerts', 'Accueil personnalisé'],
  },
]

export interface Membership {
  id: string
  client: string
  plan: string
  since: string
  nextBilling: string
  status: 'actif' | 'suspendu' | 'annule'
  soinsRestants: number | 'illimité'
}

export const memberships: Membership[] = [
  { id: '1', client: 'Aïssatou Diop', plan: 'Gold', since: '2025-09-01', nextBilling: '2026-07-01', status: 'actif', soinsRestants: 2 },
  { id: '2', client: 'Cheikh Sarr', plan: 'Platinum', since: '2025-01-15', nextBilling: '2026-07-15', status: 'actif', soinsRestants: 'illimité' },
  { id: '3', client: 'Rokhaya Thiaw', plan: 'Silver', since: '2026-01-01', nextBilling: '2026-07-01', status: 'actif', soinsRestants: 1 },
  { id: '4', client: 'Mamadou Traoré', plan: 'Platinum', since: '2024-06-01', nextBilling: '2026-07-01', status: 'actif', soinsRestants: 'illimité' },
  { id: '5', client: 'Aminata Mbaye', plan: 'Gold', since: '2025-11-01', nextBilling: '2026-07-01', status: 'actif', soinsRestants: 3 },
  { id: '6', client: 'Modou Faye', plan: 'Silver', since: '2026-02-15', nextBilling: '2026-07-15', status: 'actif', soinsRestants: 0 },
  { id: '7', client: 'Bintou Camara', plan: 'Bronze', since: '2026-04-01', nextBilling: '2026-07-01', status: 'actif', soinsRestants: 1 },
  { id: '8', client: 'Mariama Bâ', plan: 'Bronze', since: '2026-05-01', nextBilling: '2026-07-01', status: 'actif', soinsRestants: 0 },
  { id: '9', client: 'Ousmane Gueye', plan: 'Silver', since: '2025-08-01', nextBilling: '2026-07-01', status: 'suspendu', soinsRestants: 1 },
  { id: '10', client: 'Khady Diouf', plan: 'Bronze', since: '2026-03-01', nextBilling: '2026-07-01', status: 'actif', soinsRestants: 1 },
  { id: '11', client: 'Ndèye Sall', plan: 'Gold', since: '2025-12-01', nextBilling: '2026-07-01', status: 'actif', soinsRestants: 2 },
  { id: '12', client: 'Ibrahima Cissé', plan: 'Bronze', since: '2026-06-01', nextBilling: '2026-07-01', status: 'actif', soinsRestants: 1 },
]

// ─── Prestations ──────────────────────────────────────────────────────────────

export interface Service {
  id: string
  name: string
  category: string
  description: string
  duration: number
  price: number
  active: boolean
}

export const services: Service[] = [
  { id: '1', name: 'Massage suédois', category: 'Massages', description: 'Massage relaxant aux manœuvres longues et fluides pour détendre les muscles.', duration: 60, price: 25000, active: true },
  { id: '2', name: 'Massage aux pierres chaudes', category: 'Massages', description: 'Pierres de basalte chauffées pour une détente musculaire profonde.', duration: 90, price: 35000, active: true },
  { id: '3', name: 'Massage profond', category: 'Massages', description: 'Travail des couches musculaires profondes pour les tensions chroniques.', duration: 75, price: 32000, active: true },
  { id: '4', name: 'Massage dos & nuque', category: 'Massages', description: 'Ciblé sur le dos, épaules et nuque, idéal en pause déjeuner.', duration: 30, price: 15000, active: true },
  { id: '5', name: 'Massage ayurvédique', category: 'Massages', description: 'Technique indienne aux huiles chaudes pour équilibrer corps et esprit.', duration: 90, price: 40000, active: true },
  { id: '6', name: 'Soin hydratant visage', category: 'Soins visage', description: 'Soin nourrissant avec masque et sérum pour une peau lumineuse.', duration: 45, price: 18000, active: true },
  { id: '7', name: 'Lifting visage', category: 'Soins visage', description: 'Soin raffermissant avec techniques de drainage et modelage.', duration: 60, price: 30000, active: true },
  { id: '8', name: 'Soin anti-âge', category: 'Soins visage', description: 'Protocole complet anti-rides avec actifs premium.', duration: 60, price: 38000, active: true },
  { id: '9', name: 'Peeling doux', category: 'Soins visage', description: 'Exfoliation douce pour révéler un teint éclatant.', duration: 45, price: 22000, active: true },
  { id: '10', name: 'Gommage corps', category: 'Soins corps', description: 'Exfoliation au sel marin pour une peau douce et régénérée.', duration: 50, price: 20000, active: true },
  { id: '11', name: 'Enveloppement aux algues', category: 'Soins corps', description: 'Enveloppement reminéralisant aux algues marines du Sénégal.', duration: 60, price: 28000, active: true },
  { id: '12', name: 'Enveloppement chocolat', category: 'Soins corps', description: 'Soin antioxydant et hydratant au cacao pur.', duration: 60, price: 30000, active: true },
  { id: '13', name: 'Manucure soin', category: 'Beauté', description: 'Soin complet des mains avec pose de vernis semi-permanent.', duration: 45, price: 12000, active: true },
  { id: '14', name: 'Pédicure soin', category: 'Beauté', description: 'Soin complet des pieds avec gommage et pose de vernis.', duration: 50, price: 12000, active: true },
  { id: '15', name: 'Extension de cils', category: 'Beauté', description: 'Pose de cils volume russe pour un regard intense.', duration: 90, price: 25000, active: false },
]
