'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function StafDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [riwayat, setRiwayat] = useState<any[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    fetch('/api/absensi/riwayat?limit=7')
      .then((r) => r.json())
      .then((data) => setRiwayat(data.absensi || []))
  }, [])

  const nama = session?.user?.name || 'Staf'
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white px-6 py-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-green-300 text-sm">Assalamualaikum,</p>
            <h1 className="text-xl font-bold">{nama}</h1>
            <p className="text-green-200 text-xs mt-0.5">{today}</p>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-green-200 hover:text-white text-sm mt-1">
            Keluar
          </button>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto space-y-4">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Absensi Sekarang</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/absensi/wajah"
              className="flex flex-col items-center justify-center gap-2 bg-green-50 border-2 border-green-200 hover:border-green-400 rounded-xl p-4 transition-colors"
            >
              <span className="text-4xl">👤</span>
              <span className="font-semibold text-green-800 text-sm">Absensi Wajah</span>
            </Link>
            <Link
              href="/absensi/qrcode"
              className="flex flex-col items-center justify-center gap-2 bg-blue-50 border-2 border-blue-200 hover:border-blue-400 rounded-xl p-4 transition-colors"
            >
              <span className="text-4xl">📱</span>
              <span className="font-semibold text-blue-800 text-sm">Scan QR Code</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-700 mb-3">Riwayat 7 Hari Terakhir</h2>
          {riwayat.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Belum ada data absensi</p>
          ) : (
            <div className="space-y-2">
              {riwayat.map((a: any) => (
                <div key={a.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(a.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {a.jamMasuk ? new Date(a.jamMasuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      {' → '}
                      {a.jamKeluar ? new Date(a.jamKeluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    a.status === 'HADIR' ? 'bg-green-100 text-green-700' :
                    a.status === 'IZIN' ? 'bg-yellow-100 text-yellow-700' :
                    a.status === 'SAKIT' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
