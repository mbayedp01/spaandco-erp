export type UserRole = 'admin' | 'caissier' | 'medecin'

export const ROLE_LABELS: Record<UserRole, string> = {
  admin:    'Administrateur',
  caissier: 'Caissier',
  medecin:  'Médecin',
}

export const ROLE_COLORS: Record<UserRole, string> = {
  admin:    'bg-primary-100 text-primary-700',
  caissier: 'bg-emerald-100 text-emerald-700',
  medecin:  'bg-blue-100 text-blue-700',
}

// Routes accessible par rôle (sans le préfixe /)
const ROLE_ROUTES: Record<UserRole, string[]> = {
  admin: [
    'dashboard', 'clients', 'subscriptions', 'appointments', 'services',
    'staff', 'planning', 'inventory', 'suppliers',
    'cash', 'accounting', 'marketing', 'reports', 'settings',
  ],
  caissier: [
    'dashboard', 'clients', 'subscriptions', 'appointments', 'cash',
  ],
  medecin: [
    'dashboard', 'clients', 'subscriptions', 'appointments', 'services', 'planning',
  ],
}

export function canAccess(role: UserRole, path: string): boolean {
  const segment = path.replace(/^\//, '').split('/')[0]
  return ROLE_ROUTES[role]?.includes(segment) ?? false
}

export function getDefaultRoute(_role: UserRole): string {
  return '/dashboard'
}
