'use client'

import { useState } from 'react'
import { dapatkanLokasi, validasiLokasi } from '@/lib/lokasi'

interface LokasiValidatorProps {
  onValid: (lat: number, lng: number) => void
  onInvalid?: (jarak: number) => void
}

export default function LokasiValidator({ onValid, onInvalid }: LokasiValidatorProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid' | 'error'>('idle')
  const [pesan, setPesan] = useState('')
  const [jarak, setJarak] = useState(0)

  const cekLokasi = async () => {
    setStatus('loading')
    setPesan('Mendapatkan lokasi...')
    try {
      const coords = await dapatkanLokasi()
      const { valid, jarakMeter } = validasiLokasi(coords.latitude, coords.longitude)
      setJarak(jarakMeter)

      if (valid) {
        setStatus('valid')
        setPesan(`Lokasi valid (${jarakMeter}m dari pesantren)`)
        onValid(coords.latitude, coords.longitude)
      } else {
        setStatus('invalid')
        setPesan(`Di luar area (${jarakMeter}m dari pesantren)`)
        onInvalid?.(jarakMeter)
      }
    } catch (err: any) {
      setStatus('error')
      setPesan(err.message || 'Gagal mendapatkan lokasi')
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {status === 'idle' && (
        <button
          onClick={cekLokasi}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Verifikasi Lokasi
        </button>
      )}

      {status !== 'idle' && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm ${
          status === 'loading' ? 'bg-blue-50 text-blue-700' :
          status === 'valid' ? 'bg-green-50 text-green-700' :
          'bg-red-50 text-red-700'
        }`}>
          {status === 'loading' && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {status === 'valid' && <span>✓</span>}
          {(status === 'invalid' || status === 'error') && <span>✗</span>}
          {pesan}
        </div>
      )}

      {(status === 'invalid' || status === 'error') && (
        <button onClick={cekLokasi} className="text-sm text-blue-600 hover:underline">
          Coba lagi
        </button>
      )}
    </div>
  )
}
