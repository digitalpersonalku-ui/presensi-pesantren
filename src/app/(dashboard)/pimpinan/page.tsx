'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PimpinanDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stat, setStat] = useState({ hadir: 0, alpha: 0, izin: 0, totalStaf: 0 })
  const [absensi, setAbsensi] = useState<any[]>([])
  const [rekap, setRekap] = useState<any[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    const now = new Date()
    Promise.all([
      fetch('/api/absensi/hari-ini').then((r) => r.json()),
      fetch(`/api/laporan?bulan=${now.getMonth() + 1}&tahun=${now.getFullYear()}`).then((r) => r.json()),
    ]).then(([hariIni, laporan]) => {
      setStat(hariIni.stat || stat)
      setAbsensi(hariIni.absensi?.slice(0, 5) || [])
      setRekap(laporan.rekap?.slice(0, 5) || [])
    })
  }, [])

  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white px-6 py-4 flex justify-between items-center shadow">
        <div>
          <h1 className="text-lg font-bold">Dashboard Pimpinan</h1>
          <p className="text-green-200 text-xs">{today}</p>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-green-200 hover:text-white text-sm">
          Keluar
        </button>
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-5">
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

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-gray-700">Kehadiran Hari Ini</h2>
            <span className="text-xs text-gray-400">{absensi.length} entri terbaru</span>
          </div>
          {absensi.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-3">Belum ada absensi</p>
          ) : (
            <div className="space-y-2">
              {absensi.map((a: any) => (
                <div key={a.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{a.user?.nama}</p>
                    <p className="text-xs text-gray-400">
                      Masuk: {a.jamMasuk ? new Date(a.jamMasuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    a.status === 'HADIR' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-gray-700">Rekap Bulan Ini</h2>
          </div>
          {rekap.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-3">Belum ada data</p>
          ) : (
            <div className="space-y-3">
              {rekap.map((r: any) => (
                <div key={r.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{r.nama}</p>
                    <p className="text-xs text-gray-400">{r.hadir} hadir · {r.alpha} alpha</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${r.persentase >= 80 ? 'text-green-600' : r.persentase >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {r.persentase}%
                    </p>
                  </div>
                </div>
              ))}
              <Link href="/pimpinan/laporan" className="block text-center text-sm text-green-600 hover:underline pt-1">
                Lihat laporan lengkap →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
