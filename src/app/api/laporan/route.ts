import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ pesan: 'Tidak terautentikasi' }, { status: 401 })

  const role = (session.user as any).role
  if (role !== 'ADMIN' && role !== 'PIMPINAN') {
    return NextResponse.json({ pesan: 'Tidak diizinkan' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const bulan = parseInt(searchParams.get('bulan') || String(new Date().getMonth() + 1))
  const tahun = parseInt(searchParams.get('tahun') || String(new Date().getFullYear()))

  const awalBulan = new Date(tahun, bulan - 1, 1)
  const akhirBulan = new Date(tahun, bulan, 0, 23, 59, 59)

  const [stafList, absensiList] = await Promise.all([
    prisma.user.findMany({
      where: { aktif: true, role: { in: ['STAF', 'PIMPINAN'] } },
      select: { id: true, nama: true, nip: true, jabatan: true },
      orderBy: { nama: 'asc' },
    }),
    prisma.absensi.findMany({
      where: { tanggal: { gte: awalBulan, lte: akhirBulan } },
      include: { user: { select: { nama: true, nip: true } } },
      orderBy: { tanggal: 'asc' },
    }),
  ])

  const hariKerja = hitungHariKerja(awalBulan, akhirBulan)

  const rekap = stafList.map((staf) => {
    const absensiStaf = absensiList.filter((a) => a.userId === staf.id)
    const hadir = absensiStaf.filter((a) => a.status === 'HADIR').length
    const izin = absensiStaf.filter((a) => a.status === 'IZIN').length
    const sakit = absensiStaf.filter((a) => a.status === 'SAKIT').length
    const alpha = Math.max(0, hariKerja - hadir - izin - sakit)
    const persentase = hariKerja > 0 ? Math.round((hadir / hariKerja) * 100) : 0

    return { ...staf, hadir, izin, sakit, alpha, hariKerja, persentase }
  })

  return NextResponse.json({ rekap, bulan, tahun, hariKerja })
}

function hitungHariKerja(awal: Date, akhir: Date): number {
  let count = 0
  const current = new Date(awal)
  while (current <= akhir) {
    const day = current.getDay()
    if (day !== 0 && day !== 6) count++ // exclude Sabtu & Minggu
    current.setDate(current.getDate() + 1)
  }
  return count
}
