'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface StatAbsensi {
  hadir: number
  alpha: number
  izin: number
  totalStaf: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stat, setStat] = useState<StatAbsensi>({ hadir: 0, alpha: 0, izin: 0, totalStaf: 0 })
  const [absensiHariIni, setAbsensiHariIni] = useState<any[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    fetch('/api/absensi/hari-ini')
      .then((r) => r.json())
      .then((data) => {
        setAbsensiHariIni(data.absensi || [])
        setStat(data.stat || { hadir: 0, alpha: 0, izin: 0, totalStaf: 0 })
      })
  }, [])

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white px-6 py-4 flex justify-between items-center shadow">
        <div>
          <h1 className="text-lg font-bold">Dashboard Admin</h1>
          <p className="text-green-200 text-xs">{today}</p>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-green-200 hover:text-white text-sm">
          Keluar
        </button>
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total Staf', value: stat.totalStaf, color: 'bg-blue-500' },
            { label: 'Hadir', value: stat.hadir, color: 'bg-green-500' },
            { label: 'Izin/Sakit', value: stat.izin, color: 'bg-yellow-500' },
            { label: 'Alpha', value: stat.alpha, color: 'bg-red-500' },
          ].map((item) => (
            <div key={item.label} className={`${item.color} text-white rounded-xl p-4 text-center`}>
              <div className="text-3xl font-bold">{item.value}</div>
              <div className="text-sm opacity-90">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/absensi/wajah" className="bg-white rounded-xl p-4 shadow-sm border hover:border-green-400 transition-colors text-center">
            <div className="text-3xl mb-2">👤</div>
            <div className="font-semibold text-gray-700">Absensi Wajah</div>
          </Link>
          <Link href="/absensi/qrcode" className="bg-white rounded-xl p-4 shadow-sm border hover:border-green-400 transition-colors text-center">
            <div className="text-3xl mb-2">📱</div>
            <div className="font-semibold text-gray-700">Absensi QR Code</div>
          </Link>
          <Link href="/admin/staf" className="bg-white rounded-xl p-4 shadow-sm border hover:border-green-400 transition-colors text-center">
            <div className="text-3xl mb-2">👥</div>
            <div className="font-semibold text-gray-700">Data Staf</div>
          </Link>
          <Link href="/admin/laporan" className="bg-white rounded-xl p-4 shadow-sm border hover:border-green-400 transition-colors text-center">
            <div className="text-3xl mb-2">📊</div>
            <div className="font-semibold text-gray-700">Laporan</div>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-bold text-gray-700 mb-3">Absensi Hari Ini</h2>
          {absensiHariIni.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Belum ada absensi hari ini</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">Nama</th>
                    <th className="pb-2">Masuk</th>
                    <th className="pb-2">Keluar</th>
                    <th className="pb-2">Metode</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {absensiHariIni.map((a: any) => (
                    <tr key={a.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{a.user?.nama}</td>
                      <td className="py-2">{a.jamMasuk ? new Date(a.jamMasuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                      <td className="py-2">{a.jamKeluar ? new Date(a.jamKeluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                      <td className="py-2 text-xs">{a.metode}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          a.status === 'HADIR' ? 'bg-green-100 text-green-700' :
                          a.status === 'IZIN' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>{a.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
