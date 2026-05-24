import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ pesan: 'Tidak terautentikasi' }, { status: 401 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [absensi, totalStaf] = await Promise.all([
    prisma.absensi.findMany({
      where: { tanggal: { gte: today, lt: tomorrow } },
      include: { user: { select: { nama: true, jabatan: true } } },
      orderBy: { jamMasuk: 'desc' },
    }),
    prisma.user.count({ where: { aktif: true, role: 'STAF' } }),
  ])

  const hadir = absensi.filter((a) => a.status === 'HADIR').length
  const izin = absensi.filter((a) => a.status === 'IZIN' || a.status === 'SAKIT').length
  const alpha = totalStaf - hadir - izin

  return NextResponse.json({
    absensi,
    stat: { hadir, izin, alpha: Math.max(0, alpha), totalStaf },
  })
}
