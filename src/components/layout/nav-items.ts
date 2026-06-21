import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Sparkles,
  Package,
  CreditCard,
  Calculator,
  Megaphone,
  BarChart3,
  Settings,
  UserCheck,
  CalendarCheck,
  Truck,
  BadgeCheck,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  section?: string
}

export const navItems: NavItem[] = [
  { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard, section: 'Opérations' },
  { label: 'Clients', href: '/clients', icon: Users },
  { label: 'Abonnements', href: '/subscriptions', icon: BadgeCheck },
  { label: 'Rendez-vous', href: '/appointments', icon: CalendarDays },
  { label: 'Prestations', href: '/services', icon: Sparkles },
  { label: 'Personnel', href: '/staff', icon: UserCheck, section: 'Équipe & Stock' },
  { label: 'Planning', href: '/planning', icon: CalendarCheck },
  { label: 'Stocks', href: '/inventory', icon: Package },
  { label: 'Fournisseurs', href: '/suppliers', icon: Truck },
  { label: 'Caisse', href: '/cash', icon: CreditCard, section: 'Finance' },
  { label: 'Comptabilité', href: '/accounting', icon: Calculator },
  { label: 'Marketing', href: '/marketing', icon: Megaphone },
  { label: 'Rapports', href: '/reports', icon: BarChart3 },
  { label: 'Paramètres', href: '/settings', icon: Settings, section: 'Système' },
]
