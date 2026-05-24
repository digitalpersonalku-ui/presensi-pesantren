'use client'

import { useEffect, useRef, useState } from 'react'

interface QRScannerProps {
  onScanned: (data: string) => void
}

export default function QRScanner({ onScanned }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState<'loading' | 'scanning' | 'success' | 'error'>('loading')
  const [pesan, setPesan] = useState('Memuat kamera...')
  const streamRef = useRef<MediaStream | null>(null)
  const scannedRef = useRef(false)

  useEffect(() => {
    startScanner()
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      const { BrowserQRCodeReader } = await import('@zxing/browser')
      const reader = new BrowserQRCodeReader()
      setStatus('scanning')
      setPesan('Arahkan kamera ke QR Code')

      reader.decodeFromVideoElement(videoRef.current!, (result, err) => {
        if (result && !scannedRef.current) {
          scannedRef.current = true
          setStatus('success')
          setPesan('QR Code berhasil dibaca!')
          onScanned(result.getText())
        }
      })
    } catch (err) {
      setStatus('error')
      setPesan('Tidak dapat mengakses kamera')
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative rounded-xl overflow-hidden bg-black w-full max-w-sm aspect-square">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
        {status === 'scanning' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 border-4 border-green-400 rounded-xl animate-pulse" />
          </div>
        )}
        {status === 'success' && (
          <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
            <div className="bg-green-500 text-white px-4 py-2 rounded-full font-semibold text-lg">
              Berhasil!
            </div>
          </div>
        )}
      </div>

      <div className={`text-sm font-medium px-4 py-2 rounded-full ${
        status === 'success' ? 'bg-green-100 text-green-700' :
        status === 'error' ? 'bg-red-100 text-red-700' :
        'bg-blue-100 text-blue-700'
      }`}>
        {pesan}
      </div>
    </div>
  )
}
