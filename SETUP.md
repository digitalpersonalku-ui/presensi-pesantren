# Panduan Setup Aplikasi Absensi Pesantren

## Prasyarat
- Node.js 18+
- PostgreSQL (local atau cloud seperti Supabase/Neon)

## Langkah Setup

### 1. Konfigurasi Database
Edit file `.env.local` dan isi `DATABASE_URL` sesuai database Anda:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/absensi_pesantren"
```

Contoh untuk PostgreSQL lokal:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/absensi_pesantren"
```

### 2. Jalankan Migrasi Database
```bash
npm run db:push
```

### 3. Isi Data Awal (Seed)
```bash
npm run db:seed
```

Akun default yang dibuat:
| Role      | Email                        | Password  |
|-----------|------------------------------|-----------|
| Admin     | admin@pesantren.ac.id        | admin123  |
| Pimpinan  | pimpinan@pesantren.ac.id     | admin123  |
| Staf      | stf001@pesantren.ac.id       | staf123   |

### 4. Download Model Face Detection
Buat folder `public/models/` dan download model dari:
https://github.com/vladmandic/face-api/tree/master/model

File yang dibutuhkan:
- tiny_face_detector_model-weights_manifest.json
- tiny_face_detector_model-shard1
- face_landmark_68_model-weights_manifest.json
- face_landmark_68_model-shard1
- face_recognition_model-weights_manifest.json
- face_recognition_model-shard1

### 5. Atur Koordinat Pesantren
Edit `.env.local`:
```
NEXT_PUBLIC_PESANTREN_LAT=-6.200000   # Ganti dengan latitude pesantren
NEXT_PUBLIC_PESANTREN_LNG=106.816666  # Ganti dengan longitude pesantren
NEXT_PUBLIC_RADIUS_METER=200          # Radius absensi dalam meter
```

### 6. Jalankan Aplikasi
```bash
npm run dev
```

Buka http://localhost:3000

## Struktur Halaman
- `/login` — Halaman login
- `/dashboard` — Redirect otomatis sesuai role
- `/admin` — Dashboard admin
- `/staf` — Dashboard staf
- `/absensi/wajah` — Absensi dengan face detection
- `/absensi/qrcode` — Absensi dengan QR Code
