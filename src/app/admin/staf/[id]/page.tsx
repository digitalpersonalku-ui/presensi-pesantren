'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import QRCode from 'qrcode'

const FaceCapture = dynamic(() => import('@/components/FaceDetection/FaceCapture'), { ssr: false })

export default function DetailStafPage() {
  const { id } = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'info' | 'wajah' | 'qr'>('info')
  const [qrImage, setQrImage] = useState('')
  const [pesan, setPesan] = useState('')

  const fetchUser = () => {
    setLoading(true)
    fetch(`/api/staf/${id}`)
      .then((r) => r.json())
      .then((d) => { setUser(d.user); setLoading(false) })
  }

  useEffect(() => { fetchUser() }, [id])

  useEffect(() => {
    if (user?.qrCode) {
      QRCode.toDataURL(user.qrCode, { width: 300, margin: 2 }).then(setQrImage)
    }
  }, [user?.qrCode])

  const handleFaceRegistered = async (descriptor: Float32Array) => {
    const res = await fetch(`/api/staf/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faceData: JSON.stringify(Array.from(descriptor)) }),
    })
    if (res.ok) {
      setPesan('Data wajah berhasil disimpan!')
      fetchUser()
    } else {
      setPesan('Gagal menyimpan data wajah')
    }
  }

  const handleRegenerateQR = async () => {
    if (!confirm('Generate ulang QR Code? QR lama tidak bisa digunakan.')) return
    const res = await fetch(`/api/staf/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regenerateQr: true }),
    })
    if (res.ok) { setPesan('QR Code baru berhasil dibuat!'); fetchUser() }
  }

  const handleToggleAktif = async () => {
    const action = user.aktif ? 'nonaktifkan' : 'aktifkan'
    if (!confirm(`${action} staf ini?`)) return
    await fetch(`/api/staf/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aktif: !user.aktif }),
    })
    fetchUser()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <div className="min-h-screen flex items-center justify-center text-gray-500">Data tidak ditemukan</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white px-6 py-4 flex items-center gap-3 shadow">
        <button onClick={() => router.push('/admin/staf')} className="text-green-200 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold flex-1 truncate">{user.nama}</h1>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {pesan && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex justify-between">
            {pesan}
            <button onClick={() => setPesan('')} className="text-green-500">&times;</button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-2xl">
            {user.nama[0]}
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-800">{user.nama}</p>
            <p className="text-sm text-gray-500">{user.jabatan} · {user.nip}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
          <button
            onClick={handleToggleAktif}
            className={`text-xs px-3 py-1.5 rounded-full font-medium ${user.aktif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
          >
            {user.aktif ? 'Aktif' : 'Nonaktif'}
          </button>
        </div>

        <div className="flex bg-white rounded-xl shadow-sm overflow-hidden">
          {(['info', 'wajah', 'qr'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === t ? 'bg-green-700 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {t === 'info' ? 'Info' : t === 'wajah' ? 'Data Wajah' : 'QR Code'}
            </button>
          ))}
        </div>

        {tab === 'info' && (
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            {[
              { label: 'NIP', value: user.nip },
              { label: 'Jabatan', value: user.jabatan },
              { label: 'Role', value: user.role },
              { label: 'Email', value: user.email },
              { label: 'Data Wajah', value: user.faceData ? 'Sudah direkam' : 'Belum direkam' },
              { label: 'Status', value: user.aktif ? 'Aktif' : 'Nonaktif' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between py-1.5 border-b last:border-0">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className="text-sm font-medium text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'wajah' && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-600 mb-4 text-center">
              {user.faceData ? 'Data wajah sudah ada. Rekam ulang untuk memperbarui.' : 'Belum ada data wajah. Rekam sekarang.'}
            </p>
            <FaceCapture mode="register" onFaceDetected={handleFaceRegistered} />
          </div>
        )}

        {tab === 'qr' && (
          <div className="bg-white rounded-xl shadow-sm p-4 text-center space-y-4">
            <p className="text-sm text-gray-600">QR Code untuk absensi {user.nama}</p>
            {qrImage && (
              <img src={qrImage} alt="QR Code" className="mx-auto rounded-xl border-4 border-gray-100" />
            )}
            <div className="flex gap-3">
              <a
                href={qrImage}
                download={`QR-${user.nip}-${user.nama}.png`}
                className="flex-1 bg-green-700 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-green-800"
              >
                Download QR
              </a>
              <button
                onClick={handleRegenerateQR}
                className="flex-1 border border-red-300 text-red-600 py-2.5 rounded-xl font-medium text-sm hover:bg-red-50"
              >
                Generate Ulang
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Absensi Terakhir</h3>
          {user.absensi?.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-2">Belum ada data absensi</p>
          ) : (
            <div className="space-y-2">
              {user.absensi?.map((a: any) => (
                <div key={a.id} className="flex justify-between items-center text-sm py-1.5 border-b last:border-0">
                  <div>
                    <p className="font-medium text-gray-700">
                      {new Date(a.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {a.jamMasuk ? new Date(a.jamMasuk).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      {' — '}
                      {a.jamKeluar ? new Date(a.jamKeluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    a.status === 'HADIR' ? 'bg-green-100 text-green-700' :
                    a.status === 'IZIN' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
