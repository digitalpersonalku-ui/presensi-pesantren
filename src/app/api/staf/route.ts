import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ pesan: 'Tidak diizinkan' }, { status: 403 })
  }

  const staf = await prisma.user.findMany({
    select: {
      id: true, nama: true, email: true, nip: true,
      jabatan: true, role: true, aktif: true, qrCode: true,
      faceData: true, createdAt: true,
    },
    orderBy: { nama: 'asc' },
  })

  return NextResponse.json({ staf })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ pesan: 'Tidak diizinkan' }, { status: 403 })
  }

  const { nama, email, nip, jabatan, role, password } = await req.json()

  if (!nama || !email || !nip || !jabatan) {
    return NextResponse.json({ pesan: 'Data tidak lengkap' }, { status: 400 })
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } })
  if (existingEmail) {
    return NextResponse.json({ pesan: 'Email sudah digunakan' }, { status: 409 })
  }

  const existingNip = await prisma.user.findUnique({ where: { nip } })
  if (existingNip) {
    return NextResponse.json({ pesan: 'NIP sudah digunakan' }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(password || 'pesantren123', 10)

  const user = await prisma.user.create({
    data: {
      nama, email, nip, jabatan,
      role: role || 'STAF',
      password: hashedPassword,
      qrCode: randomUUID(),
    },
  })

  return NextResponse.json({ pesan: 'Staf berhasil ditambahkan', id: user.id }, { status: 201 })
}
