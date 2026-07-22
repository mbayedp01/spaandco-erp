import { Header } from '@/components/layout/header'
import { getAppUsers } from '@/lib/db/users'
import { getEstablishments } from '@/lib/db/establishments'
import { getCurrentUserRole } from '@/lib/user-role'
import { UsersView } from './users-view'
import { redirect } from 'next/navigation'

export default async function UsersPage() {
  const role = await getCurrentUserRole()
  if (role !== 'admin') redirect('/dashboard')

  const [users, establishments] = await Promise.all([
    getAppUsers(),
    getEstablishments(),
  ])

  return (
    <>
      <Header title="Utilisateurs" />
      <UsersView users={users} establishments={establishments} />
    </>
  )
}
