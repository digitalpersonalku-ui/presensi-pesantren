'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PimpinanLaporanPage() {
  const router = useRouter()
  const now = new Date()
  const [bulan, setBulan] = useState(now.getMonth() + 1)
  const [tahun, setTahun] = useState(now.getFullYear())
  const [rekap, setRekap] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/laporan?bulan=${bulan}&tahun=${tahun}`)
      .then((r) => r.json())
      .then((d) => { setRekap(d.rekap || []); setLoading(false) })
  }, [bulan, tahun])

  const namaBulanList = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white px-6 py-4 flex items-center gap-3 shadow">
        <button onClick={() => router.push('/pimpinan')} className="text-green-200 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold flex-1">Laporan Kehadiran</h1>
      </header>

      <main className="p-4 max-w-3xl mx-auto space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <select
              value={bulan}
              onChange={(e) => setBulan(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {namaBulanList.map((n, i) => <option key={i} value={i + 1}>{n}</option>)}
            </select>
          </div>
          <div className="w-24">
            <select
              value={tahun}
              onChange={(e) => setTahun(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400">Memuat laporan...</div>
        ) : (
          <div className="space-y-2">
            {rekap.map((r: any) => (
              <div key={r.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{r.nama}</p>
                    <p className="text-xs text-gray-400">{r.jabatan}</p>
                  </div>
                  <span className={`text-lg font-bold ${r.persentase >= 80 ? 'text-green-600' : r.persentase >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {r.persentase}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all ${r.persentase >= 80 ? 'bg-green-500' : r.persentase >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${r.persentase}%` }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'Hadir', value: r.hadir, color: 'text-green-600' },
                    { label: 'Izin', value: r.izin, color: 'text-yellow-600' },
                    { label: 'Sakit', value: r.sakit, color: 'text-orange-600' },
                    { label: 'Alpha', value: r.alpha, color: 'text-red-600' },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-lg py-1.5">
                      <p className={`font-bold ${item.color}`}>{item.value}</p>
                      <p className="text-xs text-gray-400">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
