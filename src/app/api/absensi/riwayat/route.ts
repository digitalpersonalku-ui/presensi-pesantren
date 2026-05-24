import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ pesan: 'Tidak terautentikasi' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '30')
  const userId = (session.user as any).id

  const absensi = await prisma.absensi.findMany({
    where: { userId },
    orderBy: { tanggal: 'desc' },
    take: limit,
  })

  return NextResponse.json({ absensi })
}
