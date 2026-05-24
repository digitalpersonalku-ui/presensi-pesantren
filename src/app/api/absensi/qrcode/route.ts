import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { validasiLokasi } from '@/lib/lokasi'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ pesan: 'Tidak terautentikasi' }, { status: 401 })
  }

  const { qrCode, lat, lng } = await req.json()

  if (!qrCode || !lat || !lng) {
    return NextResponse.json({ pesan: 'Data tidak lengkap' }, { status: 400 })
  }

  const { valid, jarakMeter } = validasiLokasi(lat, lng)

  const userTarget = await prisma.user.findUnique({ where: { qrCode } })
  if (!userTarget) {
    return NextResponse.json({ pesan: 'QR Code tidak valid' }, { status: 404 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const existingAbsensi = await prisma.absensi.findFirst({
    where: {
      userId: userTarget.id,
      tanggal: { gte: today, lt: tomorrow },
      jamMasuk: { not: null },
    },
  })

  const now = new Date()

  if (!existingAbsensi) {
    await prisma.absensi.create({
      data: {
        userId: userTarget.id,
        tanggal: now,
        jamMasuk: now,
        status: 'HADIR',
        metode: 'QRCODE',
        lokasiLat: lat,
        lokasiLng: lng,
        lokasiValid: valid,
      },
    })
    return NextResponse.json({
      pesan: `Absensi masuk ${userTarget.nama} berhasil`,
    })
  }

  if (!existingAbsensi.jamKeluar) {
    await prisma.absensi.update({
      where: { id: existingAbsensi.id },
      data: { jamKeluar: now },
    })
    return NextResponse.json({ pesan: `Absensi keluar ${userTarget.nama} berhasil` })
  }

  return NextResponse.json({ pesan: 'Absensi hari ini sudah lengkap' }, { status: 400 })
}
