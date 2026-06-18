import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ZenSpa ERP',
  description: 'Gestion complète de spas et centres de bien-être',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="bg-stone-50 dark:bg-slate-950">{children}</body>
    </html>
  )
}
