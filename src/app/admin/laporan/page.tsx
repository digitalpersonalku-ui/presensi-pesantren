'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface RekapStaf {
  id: string
  nama: string
  nip: string
  jabatan: string
  hadir: number
  izin: number
  sakit: number
  alpha: number
  hariKerja: number
  persentase: number
}

export default function LaporanPage() {
  const router = useRouter()
  const now = new Date()
  const [bulan, setBulan] = useState(now.getMonth() + 1)
  const [tahun, setTahun] = useState(now.getFullYear())
  const [rekap, setRekap] = useState<RekapStaf[]>([])
  const [hariKerja, setHariKerja] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchLaporan = () => {
    setLoading(true)
    fetch(`/api/laporan?bulan=${bulan}&tahun=${tahun}`)
      .then((r) => r.json())
      .then((d) => { setRekap(d.rekap || []); setHariKerja(d.hariKerja || 0); setLoading(false) })
  }

  useEffect(() => { fetchLaporan() }, [bulan, tahun])

  const exportCSV = () => {
    const namaBulan = new Date(tahun, bulan - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    const header = ['Nama', 'NIP', 'Jabatan', 'Hadir', 'Izin', 'Sakit', 'Alpha', 'Hari Kerja', 'Persentase'].join(',')
    const rows = rekap.map((r) => [r.nama, r.nip, r.jabatan, r.hadir, r.izin, r.sakit, r.alpha, r.hariKerja, `${r.persentase}%`].join(','))
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `laporan-absensi-${namaBulan}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const namaBulanList = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

  const totalHadir = rekap.reduce((s, r) => s + r.hadir, 0)
  const totalAlpha = rekap.reduce((s, r) => s + r.alpha, 0)
  const rataKehadiran = rekap.length > 0 ? Math.round(rekap.reduce((s, r) => s + r.persentase, 0) / rekap.length) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white px-6 py-4 flex items-center gap-3 shadow">
        <button onClick={() => router.push('/admin')} className="text-green-200 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold flex-1">Laporan Absensi</h1>
        <button onClick={exportCSV} className="bg-white text-green-800 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-50">
          Export CSV
        </button>
      </header>

      <main className="p-4 max-w-5xl mx-auto space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Bulan</label>
            <select
              value={bulan}
              onChange={(e) => setBulan(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {namaBulanList.map((n, i) => <option key={i} value={i + 1}>{n}</option>)}
            </select>
          </div>
          <div className="w-24">
            <label className="block text-xs text-gray-500 mb-1">Tahun</label>
            <select
              value={tahun}
              onChange={(e) => setTahun(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-green-600">{rataKehadiran}%</p>
            <p className="text-xs text-gray-500 mt-1">Rata Kehadiran</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-blue-600">{totalHadir}</p>
            <p className="text-xs text-gray-500 mt-1">Total Hadir</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-red-500">{totalAlpha}</p>
            <p className="text-xs text-gray-500 mt-1">Total Alpha</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400">Memuat laporan...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Nama</th>
                    <th className="text-center px-3 py-3 text-gray-600 font-semibold">Hadir</th>
                    <th className="text-center px-3 py-3 text-gray-600 font-semibold">Izin</th>
                    <th className="text-center px-3 py-3 text-gray-600 font-semibold">Sakit</th>
                    <th className="text-center px-3 py-3 text-gray-600 font-semibold">Alpha</th>
                    <th className="text-center px-3 py-3 text-gray-600 font-semibold">%</th>
                  </tr>
                </thead>
                <tbody>
                  {rekap.map((r) => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{r.nama}</p>
                        <p className="text-xs text-gray-400">{r.jabatan}</p>
                      </td>
                      <td className="px-3 py-3 text-center font-semibold text-green-600">{r.hadir}</td>
                      <td className="px-3 py-3 text-center text-yellow-600">{r.izin}</td>
                      <td className="px-3 py-3 text-center text-orange-600">{r.sakit}</td>
                      <td className="px-3 py-3 text-center font-semibold text-red-500">{r.alpha}</td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-16 bg-gray-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${r.persentase >= 80 ? 'bg-green-500' : r.persentase >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${r.persentase}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold ${r.persentase >= 80 ? 'text-green-600' : r.persentase >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {r.persentase}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <p className="text-xs text-gray-400 text-center">Hari kerja bulan ini: {hariKerja} hari (Senin–Jumat)</p>
      </main>
    </div>
  )
}
