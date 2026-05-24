'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

interface FaceCaptureProps {
  onFaceDetected: (descriptor: Float32Array) => void
  mode: 'register' | 'verify'
  targetDescriptor?: Float32Array
}

export default function FaceCapture({ onFaceDetected, mode, targetDescriptor }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'detecting' | 'success' | 'error'>('loading')
  const [pesan, setPesan] = useState('Memuat model deteksi wajah...')
  const [faceapiLoaded, setFaceapiLoaded] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const loadFaceApi = async () => {
      try {
        const faceapi = await import('@vladmandic/face-api')
        const MODEL_URL = '/models'
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ])
        setFaceapiLoaded(true)
        await startCamera()
        setStatus('ready')
        setPesan('Arahkan wajah ke kamera')
      } catch (err) {
        console.error('Face detection error:', err)
        setStatus('error')
        setPesan('Gagal memuat model deteksi wajah')
      }
    }
    loadFaceApi()
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
    streamRef.current = stream
    if (videoRef.current) {
      videoRef.current.srcObject = stream
      await videoRef.current.play()
    }
  }

  const detectFace = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !faceapiLoaded) return
    const faceapi = await import('@vladmandic/face-api')

    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor()

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!detection) {
      setPesan('Wajah tidak terdeteksi, pastikan pencahayaan cukup')
      return
    }

    const dims = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight }
    faceapi.matchDimensions(canvas, dims)
    const resized = faceapi.resizeResults(detection, dims)

    faceapi.draw.drawDetections(canvas, resized)
    faceapi.draw.drawFaceLandmarks(canvas, resized)

    if (mode === 'verify' && targetDescriptor) {
      const distance = faceapi.euclideanDistance(detection.descriptor, targetDescriptor)
      if (distance < 0.5) {
        setStatus('success')
        setPesan('Wajah dikenali!')
        if (intervalRef.current) clearInterval(intervalRef.current)
        onFaceDetected(detection.descriptor)
      } else {
        setPesan(`Wajah tidak cocok (jarak: ${distance.toFixed(2)})`)
      }
    } else if (mode === 'register') {
      setStatus('success')
      setPesan('Wajah berhasil direkam!')
      if (intervalRef.current) clearInterval(intervalRef.current)
      onFaceDetected(detection.descriptor)
    }
  }, [faceapiLoaded, mode, targetDescriptor, onFaceDetected])

  const mulaiDeteksi = () => {
    setStatus('detecting')
    setPesan('Mendeteksi wajah...')
    intervalRef.current = setInterval(detectFace, 500)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative rounded-xl overflow-hidden bg-black w-full max-w-sm aspect-video">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        {status === 'success' && (
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
            <div className="bg-green-500 text-white px-4 py-2 rounded-full font-semibold">
              Terverifikasi
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

      {status === 'ready' && (
        <button
          onClick={mulaiDeteksi}
          className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg font-semibold"
        >
          {mode === 'register' ? 'Rekam Wajah' : 'Verifikasi Wajah'}
        </button>
      )}
    </div>
  )
}
