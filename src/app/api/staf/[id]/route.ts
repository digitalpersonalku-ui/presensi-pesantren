import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

export async function GET(
  _: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ pesan: 'Tidak diizinkan' }, { status: 403 })
  }

  const user = await prisma.user.findUnique({
    where: { id: id },
    select: {
      id: true, nama: true, email: true, nip: true,
      jabatan: true, role: true, aktif: true, qrCode: true,
      faceData: true, createdAt: true,
      absensi: { orderBy: { tanggal: 'desc' }, take: 10 },
    },
  })

  if (!user) return NextResponse.json({ pesan: 'Tidak ditemukan' }, { status: 404 })
  return NextResponse.json({ user })
}

export async function PATCH(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ pesan: 'Tidak diizinkan' }, { status: 403 })
  }

  const body = await req.json()
  const updateData: any = {}

  if (body.nama) updateData.nama = body.nama
  if (body.jabatan) updateData.jabatan = body.jabatan
  if (body.role) updateData.role = body.role
  if (typeof body.aktif === 'boolean') updateData.aktif = body.aktif
  if (body.password) updateData.password = await bcrypt.hash(body.password, 10)
  if (body.faceData !== undefined) updateData.faceData = body.faceData
  if (body.regenerateQr) updateData.qrCode = randomUUID()

  const user = await prisma.user.update({ where: { id: id }, data: updateData })
  return NextResponse.json({ pesan: 'Data berhasil diperbarui', qrCode: user.qrCode })
}

export async function DELETE(
  _: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ pesan: 'Tidak diizinkan' }, { status: 403 })
  }

  await prisma.user.update({ where: { id: id }, data: { aktif: false } })
  return NextResponse.json({ pesan: 'Staf dinonaktifkan' })
}