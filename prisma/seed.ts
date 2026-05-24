import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  const adminPass = await bcrypt.hash('admin123', 10)
  const stafPass = await bcrypt.hash('staf123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@pesantren.ac.id' },
    update: {},
    create: {
      nama: 'Administrator',
      email: 'admin@pesantren.ac.id',
      password: adminPass,
      role: 'ADMIN',
      nip: 'ADM001',
      jabatan: 'Administrator Sistem',
      qrCode: randomUUID(),
    },
  })

  await prisma.user.upsert({
    where: { email: 'pimpinan@pesantren.ac.id' },
    update: {},
    create: {
      nama: 'KH. Ahmad Mukhlis',
      email: 'pimpinan@pesantren.ac.id',
      password: adminPass,
      role: 'PIMPINAN',
      nip: 'PIM001',
      jabatan: 'Ketua Yayasan',
      qrCode: randomUUID(),
    },
  })

  const stafData = [
    { nama: 'Ustadz Budi Santoso', jabatan: 'Guru Al-Quran', nip: 'STF001' },
    { nama: 'Ustadzah Siti Rahayu', jabatan: 'Guru Fiqih', nip: 'STF002' },
    { nama: 'Ahmad Fauzi', jabatan: 'Staff Tata Usaha', nip: 'STF003' },
    { nama: 'Nurul Hidayah', jabatan: 'Bendahara', nip: 'STF004' },
  ]

  for (const staf of stafData) {
    const email = `${staf.nip.toLowerCase()}@pesantren.ac.id`
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        nama: staf.nama,
        email,
        password: stafPass,
        role: 'STAF',
        nip: staf.nip,
        jabatan: staf.jabatan,
        qrCode: randomUUID(),
      },
    })
  }

  await prisma.pengaturan.upsert({
    where: { kunci: 'JAM_MASUK' },
    update: {},
    create: { kunci: 'JAM_MASUK', nilai: '07:00' },
  })
  await prisma.pengaturan.upsert({
    where: { kunci: 'JAM_KELUAR' },
    update: {},
    create: { kunci: 'JAM_KELUAR', nilai: '16:00' },
  })

  console.log('Seed berhasil! Akun default:')
  console.log('  Admin    : admin@pesantren.ac.id / admin123')
  console.log('  Pimpinan : pimpinan@pesantren.ac.id / admin123')
  console.log('  Staf     : stf001@pesantren.ac.id / staf123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
