'use client'

import { useEffect, useState } from 'react'

export default function FaceAPITestPage() {
  const [status, setStatus] = useState<'loading' | 'testing' | 'success' | 'error'>('loading')
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    const testFaceAPI = async () => {
      try {
        addMessage('Memulai test face-api...')

        // Test 1: Import face-api
        addMessage('Test 1: Mengimport @vladmandic/face-api...')
        const faceapi = await import('@vladmandic/face-api')
        addMessage('✓ Face-api berhasil diimport')

        // Test 2: Check if nets exist
        addMessage('Test 2: Memeriksa nets...')
        if (!faceapi.nets) {
          throw new Error('faceapi.nets tidak tersedia')
        }
        addMessage('✓ faceapi.nets tersedia')

        // Test 3: Try to load models
        setStatus('testing')
        addMessage('Test 3: Mengunduh model dari /models...')
        const MODEL_URL = '/models'

        // Test each model loading
        addMessage('  Loading: tiny_face_detector...')
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
        addMessage('  ✓ tiny_face_detector loaded')

        addMessage('  Loading: faceLandmark68...')
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
        addMessage('  ✓ faceLandmark68 loaded')

        addMessage('  Loading: faceRecognition...')
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        addMessage('  ✓ faceRecognition loaded')

        addMessage('✓ Semua model berhasil dimuat!')
        setStatus('success')
        addMessage('🎉 Face-api sepenuhnya berfungsi!')
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        addMessage(`❌ Error: ${errorMsg}`)
        console.error('Full error:', err)
        setStatus('error')
      }
    }

    testFaceAPI()
  }, [])

  const addMessage = (msg: string) => {
    setMessages(prev => [...prev, msg])
    console.log(msg)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Face-API Diagnostic Test</h1>

        <div className={`mb-4 p-4 rounded-lg ${
          status === 'success' ? 'bg-green-100 text-green-800' :
          status === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          Status: <strong>{status}</strong>
        </div>

        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
          {messages.map((msg, idx) => (
            <div key={idx}>{msg}</div>
          ))}
          {messages.length === 0 && <div>Initializing...</div>}
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p><strong>What this test does:</strong></p>
          <ul className="list-disc list-inside mt-2">
            <li>Imports the face-api library</li>
            <li>Checks if neural networks are available</li>
            <li>Attempts to load all 3 model sets from /models/</li>
            <li>Reports any errors encountered</li>
          </ul>

          <p className="mt-4"><strong>If you see errors:</strong></p>
          <ul className="list-disc list-inside mt-2">
            <li>Check the browser console (F12) for detailed error messages</li>
            <li>Check the Network tab to see if model files are 404</li>
            <li>Verify models exist: curl http://localhost:3000/api/test-models</li>
            <li>Try clearing browser cache: Ctrl+Shift+Del</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
