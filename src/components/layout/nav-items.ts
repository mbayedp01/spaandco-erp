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
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import type { UserRole } from '@/lib/roles'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  section?: string
  roles: UserRole[]
}

export const navItems: NavItem[] = [
  { label: 'Tableau de bord', href: '/dashboard',     icon: LayoutDashboard, section: 'Opérations', roles: ['admin', 'caissier', 'medecin'] },
  { label: 'Clients',         href: '/clients',        icon: Users,                                  roles: ['admin', 'caissier', 'medecin'] },
  { label: 'Abonnements',     href: '/subscriptions',  icon: BadgeCheck,                             roles: ['admin', 'caissier', 'medecin'] },
  { label: 'Rendez-vous',     href: '/appointments',   icon: CalendarDays,                           roles: ['admin', 'caissier', 'medecin'] },
  { label: 'Prestations',     href: '/services',       icon: Sparkles,                               roles: ['admin', 'medecin'] },
  { label: 'Personnel',       href: '/staff',          icon: UserCheck,       section: 'Équipe & Stock', roles: ['admin'] },
  { label: 'Planning',        href: '/planning',       icon: CalendarCheck,                          roles: ['admin', 'medecin'] },
  { label: 'Stocks',          href: '/inventory',      icon: Package,                                roles: ['admin', 'caissier'] },
  { label: 'Fournisseurs',    href: '/suppliers',      icon: Truck,                                  roles: ['admin'] },
  { label: 'Caisse',          href: '/cash',           icon: CreditCard,      section: 'Finance',   roles: ['admin', 'caissier'] },
  { label: 'Comptabilité',    href: '/accounting',     icon: Calculator,                             roles: ['admin'] },
  { label: 'Marketing',       href: '/marketing',      icon: Megaphone,                              roles: ['admin'] },
  { label: 'Rapports',        href: '/reports',        icon: BarChart3,                              roles: ['admin'] },
  { label: 'Utilisateurs',    href: '/users',          icon: ShieldCheck,     section: 'Système',   roles: ['admin'] },
  { label: 'Paramètres',      href: '/settings',       icon: Settings,                               roles: ['admin'] },
]

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return navItems.filter(item => item.roles.includes(role))
}
