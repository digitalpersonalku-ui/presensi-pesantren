'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardRedirect() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) { router.push('/login'); return }

    const role = (session.user as any).role
    if (role === 'ADMIN') router.push('/admin')
    else if (role === 'PIMPINAN') router.push('/pimpinan')
    else router.push('/staf')
  }, [session, status, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Memuat dashboard...</p>
      </div>
    </div>
  )
}
