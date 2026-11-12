export type UserRole = 'admin' | 'caissier' | 'comptable' | 'stock'

export const ROLE_LABELS: Record<UserRole, string> = {
  admin:     'Administrateur',
  caissier:  'Caissier',
  comptable: 'Comptable',
  stock:     'Gestionnaire de stock',
}

export const ROLE_COLORS: Record<UserRole, string> = {
  admin:     'bg-primary-100 text-primary-700',
  caissier:  'bg-emerald-100 text-emerald-700',
  comptable: 'bg-blue-100 text-blue-700',
  stock:     'bg-amber-100 text-amber-700',
}

// Accès caissier de base, réutilisé par le comptable
const CAISSIER_ROUTES = [
  'dashboard', 'clients', 'subscriptions', 'appointments', 'services',
  'cash', 'inventory', 'suppliers',
]

// Routes accessibles par rôle (sans le préfixe /)
const ROLE_ROUTES: Record<UserRole, string[]> = {
  admin: [
    'dashboard', 'clients', 'subscriptions', 'appointments', 'services',
    'staff', 'planning', 'inventory', 'suppliers',
    'cash', 'accounting', 'marketing', 'reports', 'settings', 'users',
  ],
  caissier: CAISSIER_ROUTES,
  // Comptable : tous les accès du caissier + la comptabilité et les rapports
  comptable: [...CAISSIER_ROUTES, 'staff', 'accounting', 'reports'],
  stock: ['inventory', 'suppliers'],
}

export function canAccess(role: UserRole, path: string): boolean {
  const segment = path.replace(/^\//, '').split('/')[0]
  return ROLE_ROUTES[role]?.includes(segment) ?? false
}

export function getDefaultRoute(role: UserRole): string {
  return role === 'stock' ? '/inventory' : '/dashboard'
}
