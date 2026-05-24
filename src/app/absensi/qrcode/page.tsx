'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import LokasiValidator from '@/components/LocationValidator/LokasiValidator'

const QRScanner = dynamic(() => import('@/components/QRScanner/QRScanner'), { ssr: false })

type Step = 'lokasi' | 'scan' | 'selesai'

export default function AbsensiQRPage() {
  const router = useRouter()
  // TESTING: Skip GPS validation for now
  const [step, setStep] = useState<Step>('scan')
  const [lokasi, setLokasi] = useState<{ lat: number; lng: number } | null>({ lat: -5.116957, lng: 120.254567 })
  const [loading, setLoading] = useState(false)
  const [hasil, setHasil] = useState<{ sukses: boolean; pesan: string } | null>(null)

  const handleLokasiValid = (lat: number, lng: number) => {
    setLokasi({ lat, lng })
    setStep('scan')
  }

  const handleQRScanned = async (qrData: string) => {
    if (!lokasi || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/absensi/qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: qrData, lat: lokasi.lat, lng: lokasi.lng }),
      })
      const data = await res.json()
      setHasil({ sukses: res.ok, pesan: data.pesan || (res.ok ? 'Absensi berhasil' : 'QR Code tidak valid') })
      setStep('selesai')
    } catch {
      setHasil({ sukses: false, pesan: 'Terjadi kesalahan, coba lagi' })
      setStep('selesai')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-800">Absensi QR Code</h1>
        </div>

        <div className="flex gap-2 mb-6">
          {(['lokasi', 'scan', 'selesai'] as Step[]).map((s, i) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full ${i <= (['lokasi','scan','selesai'] as Step[]).indexOf(step) ? 'bg-green-600' : 'bg-gray-200'}`} />
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          {step === 'lokasi' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <h2 className="font-semibold text-gray-800">Verifikasi Lokasi</h2>
              <p className="text-sm text-gray-500">Pastikan Anda berada di area pesantren</p>
              <LokasiValidator onValid={handleLokasiValid} />
            </div>
          )}

          {step === 'scan' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-800 text-center">Scan QR Code Absensi</h2>
              <QRScanner onScanned={handleQRScanned} />
              {loading && <p className="text-center text-sm text-gray-500">Memproses absensi...</p>}
            </div>
          )}

          {step === 'selesai' && hasil && (
            <div className="text-center space-y-4 py-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${hasil.sukses ? 'bg-green-100' : 'bg-red-100'}`}>
                <span className="text-4xl">{hasil.sukses ? '✓' : '✗'}</span>
              </div>
              <h2 className={`text-xl font-bold ${hasil.sukses ? 'text-green-700' : 'text-red-700'}`}>
                {hasil.sukses ? 'Absensi Berhasil!' : 'Absensi Gagal'}
              </h2>
              <p className="text-gray-600 text-sm">{hasil.pesan}</p>
              <p className="text-gray-500 text-xs">{new Date().toLocaleString('id-ID')}</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-green-700 text-white py-3 rounded-xl font-semibold"
              >
                Kembali ke Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
