const https = require('https')
const fs = require('fs')
const path = require('path')

const MODEL_DIR = path.join(__dirname, '..', 'public', 'models')
// Using jsDelivr CDN which reliably hosts face-api.js models
const BASE_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'

const FILES = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
]

if (!fs.existsSync(MODEL_DIR)) {
  fs.mkdirSync(MODEL_DIR, { recursive: true })
  console.log('Folder public/models/ dibuat')
}

let downloaded = 0
let failed = 0

const downloadFile = (file) => {
  const dest = path.join(MODEL_DIR, file)
  if (fs.existsSync(dest)) {
    const stats = fs.statSync(dest)
    if (stats.size > 100) {
      console.log(`[OK] ${file} (sudah ada, ${(stats.size / 1024).toFixed(2)}KB)`)
      downloaded++
      checkComplete()
      return
    } else {
      console.log(`[Re-download] ${file} (file corrupt)`)
      fs.unlinkSync(dest)
    }
  }

  const url = `${BASE_URL}/${file}`
  const writeStream = fs.createWriteStream(dest)

  https.get(url, (res) => {
    if (res.statusCode !== 200) {
      console.error(`[Error] ${file}: HTTP ${res.statusCode}`)
      fs.unlink(dest, () => {})
      failed++
      checkComplete()
      return
    }
    res.pipe(writeStream)
    writeStream.on('finish', () => {
      writeStream.close()
      const stats = fs.statSync(dest)
      console.log(`[OK] ${file} (${(stats.size / 1024).toFixed(2)}KB)`)
      downloaded++
      checkComplete()
    })
  }).on('error', (err) => {
    console.error(`[Error] ${file}: ${err.message}`)
    fs.unlink(dest, () => {})
    failed++
    checkComplete()
  })
}

const checkComplete = () => {
  if (downloaded + failed === FILES.length) {
    if (failed === 0) {
      console.log('\n✅ Semua model berhasil didownload!')
      console.log('Sekarang jalankan: npm run dev')
    } else {
      console.error(`\n❌ ${failed} file gagal didownload. Cek koneksi internet dan coba lagi.`)
      process.exit(1)
    }
  }
}

FILES.forEach(downloadFile)
