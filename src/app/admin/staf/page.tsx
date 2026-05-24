'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TambahStafModal from './TambahStafModal'

interface Staf {
  id: string
  nama: string
  email: string
  nip: string
  jabatan: string
  role: string
  aktif: boolean
  faceData: string | null
  qrCode: string
}

export default function ManajemenStafPage() {
  const router = useRouter()
  const [stafList, setStafList] = useState<Staf[]>([])
  const [loading, setLoading] = useState(true)
  const [showTambah, setShowTambah] = useState(false)
  const [search, setSearch] = useState('')

  const fetchStaf = () => {
    setLoading(true)
    fetch('/api/staf')
      .then((r) => r.json())
      .then((d) => { setStafList(d.staf || []); setLoading(false) })
  }

  useEffect(() => { fetchStaf() }, [])

  const filtered = stafList.filter(
    (s) =>
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.nip.toLowerCase().includes(search.toLowerCase()) ||
      s.jabatan.toLowerCase().includes(search.toLowerCase())
  )

  const handleNonaktifkan = async (id: string, nama: string) => {
    if (!confirm(`Nonaktifkan ${nama}?`)) return
    await fetch(`/api/staf/${id}`, { method: 'DELETE' })
    fetchStaf()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white px-6 py-4 flex items-center gap-3 shadow">
        <button onClick={() => router.push('/admin')} className="text-green-200 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold flex-1">Manajemen Staf</h1>
        <button
          onClick={() => setShowTambah(true)}
          className="bg-white text-green-800 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-50"
        >
          + Tambah
        </button>
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-4">
        <input
          type="text"
          placeholder="Cari nama, NIP, jabatan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {loading ? (
          <div className="text-center py-10 text-gray-400">Memuat data...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400">Tidak ada data staf</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((staf) => (
              <div key={staf.id} className={`bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 ${!staf.aktif ? 'opacity-50' : ''}`}>
                <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg flex-shrink-0">
                  {staf.nama[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800 truncate">{staf.nama}</p>
                    {!staf.aktif && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Nonaktif</span>}
                    {staf.faceData && <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Wajah ✓</span>}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{staf.jabatan} · {staf.nip}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Link
                    href={`/admin/staf/${staf.id}`}
                    className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium"
                  >
                    Detail
                  </Link>
                  {staf.aktif && (
                    <button
                      onClick={() => handleNonaktifkan(staf.id, staf.nama)}
                      className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium"
                    >
                      Nonaktifkan
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showTambah && (
        <TambahStafModal
          onClose={() => setShowTambah(false)}
          onSuccess={() => { setShowTambah(false); fetchStaf() }}
        />
      )}
    </div>
  )
}
