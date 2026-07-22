import { Header } from '@/components/layout/header'
import { getAppUsers } from '@/lib/db/users'
import { getCurrentUserRole } from '@/lib/user-role'
import { UsersView } from './users-view'
import { redirect } from 'next/navigation'

export default async function UsersPage() {
  const role = await getCurrentUserRole()
  if (role !== 'admin') redirect('/dashboard')

  const users = await getAppUsers()
  return (
    <>
      <Header title="Utilisateurs" />
      <UsersView users={users} />
    </>
  )
}
