const PESANTREN_LAT = parseFloat(process.env.NEXT_PUBLIC_PESANTREN_LAT || '-6.200000')
const PESANTREN_LNG = parseFloat(process.env.NEXT_PUBLIC_PESANTREN_LNG || '106.816666')
const RADIUS_METER = parseInt(process.env.NEXT_PUBLIC_RADIUS_METER || '200')

export function hitungJarak(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000 // radius bumi dalam meter
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function validasiLokasi(lat: number, lng: number): { valid: boolean; jarakMeter: number } {
  const jarak = hitungJarak(lat, lng, PESANTREN_LAT, PESANTREN_LNG)
  return { valid: jarak <= RADIUS_METER, jarakMeter: Math.round(jarak) }
}

export function dapatkanLokasi(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation tidak didukung browser ini'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => reject(new Error('Izin lokasi ditolak: ' + err.message)),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })
}
