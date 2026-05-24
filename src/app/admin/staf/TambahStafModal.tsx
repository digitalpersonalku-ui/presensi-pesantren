'use client'

import { useState } from 'react'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function TambahStafModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    nama: '', email: '', nip: '', jabatan: '', role: 'STAF', password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/staf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.pesan); setLoading(false); return }
    onSuccess()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 pt-5 pb-3 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Tambah Staf Baru</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

          {[
            { label: 'Nama Lengkap', key: 'nama', type: 'text', placeholder: 'Ustadz Ahmad Fauzi' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'ahmad@pesantren.ac.id' },
            { label: 'NIP', key: 'nip', type: 'text', placeholder: 'STF005' },
            { label: 'Jabatan', key: 'jabatan', type: 'text', placeholder: 'Guru Bahasa Arab' },
            { label: 'Password', key: 'password', type: 'password', placeholder: 'Kosongkan = pesantren123' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={(form as any)[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                required={field.key !== 'password'}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            >
              <option value="STAF">Staf</option>
              <option value="PIMPINAN">Pimpinan</option>
              <option value="SATPAM">Satpam</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50">
              Batal
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-green-700 disabled:bg-green-400 text-white py-2.5 rounded-xl font-medium">
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
