export type Kind = 'guarded' | 'lockers' | 'racks'

export interface LatLng {
  lat: number
  lng: number
}

export interface Features {
  frame: boolean
  covered: boolean
  lit: boolean
  camera: boolean
  staffed: boolean
}

export interface Reason {
  ok: boolean
  text: string
}

export interface Spot extends LatLng {
  id: string
  name: string
  street: string
  kind: Kind
  tag: string
  price: string
  features: Features
  /** Hand-written reasons from the street audit. Falls back to the checklist. */
  reasons?: Reason[]
  source: string
  verifiedAt: number
  riders: number
  thefts90: number
  /** Confirmations still needed before the spot counts as verified. */
  needs: number
  photo?: string
  confirmedByMe?: boolean
}

export interface Bike {
  name?: string
  frame: string
  brand: string
  colour: string
  photo?: string
  tracker: boolean
  stolen?: { at: number; area: string; when: string; lock: string }
}

export interface Alert {
  id: string
  kind: 'theft' | 'verify' | 'newspot'
  title: string
  detail?: string
  at: number
  spotId?: string
  done?: boolean
  mine?: boolean
}

export interface TheftReport {
  frame: string
  area: string
  at: number
}

export interface State {
  spots: Spot[]
  bike: Bike | null
  alerts: Alert[]
  reports: TheftReport[]
}

export const KINDS: Record<Kind, { label: string; color: string; level: string; noun: string }> = {
  guarded: { label: 'Guarded', color: '#00798C', level: 'Highest security level', noun: 'guarded spot' },
  lockers: { label: 'Lockers', color: '#3B8FC0', level: 'High security level', noun: 'lockers' },
  racks: { label: 'Racks', color: '#8FA6AB', level: 'Basic security level', noun: 'racks' },
}
export const KIND_ORDER: Kind[] = ['guarded', 'lockers', 'racks']

export const FEATURES: { key: keyof Features; yes: string; no: string }[] = [
  { key: 'frame', yes: 'Frame can be locked to the rack', no: 'Frame cannot be locked' },
  { key: 'covered', yes: 'Covered', no: 'Not covered' },
  { key: 'lit', yes: 'Well lit at night', no: 'Not well lit at night' },
  { key: 'camera', yes: 'Camera in view', no: 'No camera in view' },
  { key: 'staffed', yes: 'Staffed or access controlled', no: 'Not staffed or access controlled' },
]

/** Where the demo rider stands when real location is unavailable or outside the neighbourhood. */
export const DEMO_LOCATION: LatLng = { lat: 51.4356, lng: 5.47385 }
export const BERGEN_CENTER: LatLng = { lat: 51.4366, lng: 5.4748 }
export const SAMPLE_FRAME = 'AX 1257 9043'
export const SAMPLE_STOLEN_FRAME = 'BK 7731 0452'

const STREETS: [string, number, number][] = [
  ['Kleine Berg', 51.43538, 5.47372],
  ['Kleine Berg', 51.43625, 5.47445],
  ['Kleine Berg', 51.43694, 5.47522],
  ['Kleine Berg', 51.43815, 5.47565],
  ['Grote Berg', 51.43547, 5.47455],
  ['Grote Berg', 51.43591, 5.47633],
  ['Grote Berg', 51.43644, 5.47781],
  ['Bergstraat', 51.43628, 5.47694],
  ['Bergstraat', 51.43681, 5.47629],
  ['Bergstraat', 51.43724, 5.47548],
  ['Heilige Geeststraat', 51.43697, 5.47398],
  ['Heilige Geeststraat', 51.4374, 5.47291],
  ['Prins Hendrikstraat', 51.43654, 5.47362],
  ['Prins Hendrikstraat', 51.43721, 5.47235],
  ['Wilhelminaplein', 51.43802, 5.47195],
  ['Keizersgracht', 51.43751, 5.47688],
  ['Luciferstraat', 51.4353, 5.47684],
]

export function distance(a: LatLng, b: LatLng): number {
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLng = (b.lng - a.lng) * rad
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2
  return 6371000 * 2 * Math.asin(Math.sqrt(h))
}

/** Walking directions in the phone's own maps app. */
export function directionsUrl(spot: LatLng): string {
  const apple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)
  return apple
    ? `https://maps.apple.com/?daddr=${spot.lat},${spot.lng}&dirflg=w`
    : `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}&travelmode=walking`
}

export function nearestStreet(p: LatLng): string {
  let best = STREETS[0]
  let bestD = Infinity
  for (const s of STREETS) {
    const d = distance(p, { lat: s[1], lng: s[2] })
    if (d < bestD) {
      bestD = d
      best = s
    }
  }
  return bestD < 250 ? best[0] : 'De Bergen'
}

export function formatDistance(m: number): string {
  const metres = m < 1000 ? `${Math.max(10, Math.round(m / 10) * 10)} m` : `${(m / 1000).toFixed(1)} km`
  return `${metres} · ${Math.max(1, Math.ceil(m / 75))} min walk`
}

export function ago(t: number, now = Date.now()): string {
  const min = Math.floor((now - t) / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  const h = Math.floor(min / 60)
  if (h < 24) return h === 1 ? '1 hour ago' : `${h} hours ago`
  const d = Math.floor(h / 24)
  if (d === 1) return 'yesterday'
  if (d < 14) return `${d} days ago`
  return `${Math.floor(d / 7)} weeks ago`
}

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const normFrame = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '')

export function reasonsFor(spot: Spot): Reason[] {
  if (spot.reasons) return spot.reasons
  const all = FEATURES.map((f) => ({ ok: spot.features[f.key], text: spot.features[f.key] ? f.yes : f.no }))
  return [...all.filter((r) => r.ok), ...all.filter((r) => !r.ok)]
}

export function spotName(kind: Kind, street: string): string {
  if (kind === 'guarded') return `Guarded storage ${street}`
  if (kind === 'lockers') return `Lockers ${street}`
  return `Racks on ${street}`
}

export function bikeName(bike: Bike): string {
  if (bike.name) return bike.name
  if (bike.colour) return `${cap(bike.colour.trim())} bike`
  return bike.brand || 'My bike'
}

const SWATCHES: [RegExp, string][] = [
  [/dark green/i, '#2F5D46'],
  [/green/i, '#3E8E5A'],
  [/black/i, '#1B1F21'],
  [/white/i, '#F2F2F0'],
  [/grey|gray|silver/i, '#9AA5A8'],
  [/red/i, '#C62828'],
  [/blue/i, '#2F6FB5'],
  [/yellow/i, '#F2C230'],
  [/orange/i, '#E8791E'],
  [/pink/i, '#E58CA8'],
  [/purple/i, '#7A4FA3'],
  [/brown/i, '#7A5236'],
]
export function swatch(colour: string): string | null {
  return SWATCHES.find(([re]) => re.test(colour))?.[1] ?? null
}

const HOUR = 3600_000
const DAY = 24 * HOUR
const f = (frame: boolean, covered: boolean, lit: boolean, camera: boolean, staffed: boolean): Features => ({
  frame,
  covered,
  lit,
  camera,
  staffed,
})

export function seed(now = Date.now()): State {
  const spots: Spot[] = [
    {
      id: 'guarded-kleine-berg',
      name: 'Guarded storage Kleine Berg',
      street: 'Kleine Berg',
      kind: 'guarded',
      lat: 51.43694,
      lng: 5.47522,
      tag: 'Free, guarded',
      price: 'Free',
      features: f(true, true, true, true, true),
      reasons: [
        { ok: true, text: 'Staffed during opening hours' },
        { ok: true, text: 'Indoors, one supervised entrance' },
        { ok: true, text: 'Fixed racks, frame can be locked' },
        { ok: true, text: 'Camera in view' },
        { ok: false, text: 'Not open 24 hours' },
      ],
      source: 'Official listing + street audit',
      verifiedAt: now - 3 * DAY,
      riders: 4,
      thefts90: 0,
      needs: 0,
    },
    {
      id: 'lockers-grote-berg',
      name: 'Lockers Grote Berg',
      street: 'Grote Berg',
      kind: 'lockers',
      lat: 51.43591,
      lng: 5.47633,
      tag: '€1 a day, locked box',
      price: '€1 a day',
      features: f(true, true, true, false, true),
      source: 'Official listing + street audit',
      verifiedAt: now - 6 * DAY,
      riders: 3,
      thefts90: 0,
      needs: 0,
    },
    {
      id: 'lockers-wilhelminaplein',
      name: 'Lockers Wilhelminaplein',
      street: 'Wilhelminaplein',
      kind: 'lockers',
      lat: 51.43815,
      lng: 5.47181,
      tag: '€1 a day, locked box',
      price: '€1 a day',
      features: f(true, true, true, true, true),
      source: 'Official listing + street audit',
      verifiedAt: now - 9 * DAY,
      riders: 2,
      thefts90: 0,
      needs: 0,
    },
    {
      id: 'racks-bergstraat',
      name: 'Racks on Bergstraat',
      street: 'Bergstraat',
      kind: 'racks',
      lat: 51.43681,
      lng: 5.47629,
      tag: 'Free, open racks',
      price: 'Free',
      features: f(true, false, true, false, false),
      source: 'Street audit',
      verifiedAt: now - 35 * DAY,
      riders: 2,
      thefts90: 1,
      needs: 0,
    },
    {
      id: 'racks-kleine-berg',
      name: 'Racks on Kleine Berg',
      street: 'Kleine Berg',
      kind: 'racks',
      lat: 51.43544,
      lng: 5.47346,
      tag: 'Free, open racks',
      price: 'Free',
      features: f(true, false, false, false, false),
      source: 'Open bike-parking data',
      verifiedAt: now - 12 * DAY,
      riders: 3,
      thefts90: 2,
      needs: 0,
    },
    {
      id: 'racks-heilige-geeststraat',
      name: 'Racks on Heilige Geeststraat',
      street: 'Heilige Geeststraat',
      kind: 'racks',
      lat: 51.43723,
      lng: 5.47238,
      tag: 'Free, open racks',
      price: 'Free',
      features: f(true, false, true, false, false),
      source: 'Open bike-parking data',
      verifiedAt: now - 20 * DAY,
      riders: 1,
      thefts90: 0,
      needs: 0,
    },
    {
      id: 'racks-prins-hendrikstraat',
      name: 'Racks on Prins Hendrikstraat',
      street: 'Prins Hendrikstraat',
      kind: 'racks',
      lat: 51.43661,
      lng: 5.47343,
      tag: 'Free, open racks',
      price: 'Free',
      features: f(false, false, true, false, false),
      source: 'Open bike-parking data',
      verifiedAt: now - 16 * DAY,
      riders: 1,
      thefts90: 1,
      needs: 0,
    },
    {
      id: 'lockers-grote-berg-new',
      name: 'Lockers Grote Berg east',
      street: 'Grote Berg',
      kind: 'lockers',
      lat: 51.43638,
      lng: 5.47765,
      tag: 'Locked box',
      price: 'Unknown',
      features: f(true, true, false, false, true),
      source: 'Added by a rider',
      verifiedAt: now - DAY,
      riders: 1,
      thefts90: 0,
      needs: 1,
    },
  ]
  return {
    spots,
    bike: {
      name: 'Green city bike',
      frame: SAMPLE_FRAME,
      brand: 'City Classic 7-speed',
      colour: 'Dark green',
      tracker: true,
    },
    alerts: [
      {
        id: 'a-theft',
        kind: 'theft',
        title: 'Stolen bike reported near Kleine Berg',
        detail: 'taken from regular racks',
        at: now - 2 * HOUR,
      },
      {
        id: 'a-verify',
        kind: 'verify',
        title: 'Still accurate? Racks on Bergstraat',
        detail: 'you parked here yesterday',
        at: now - 20 * HOUR,
        spotId: 'racks-bergstraat',
      },
      {
        id: 'a-new',
        kind: 'newspot',
        title: 'New locker spot added near Grote Berg',
        at: now - DAY,
        spotId: 'lockers-grote-berg-new',
      },
    ],
    reports: [{ frame: normFrame(SAMPLE_STOLEN_FRAME), area: 'Kleine Berg', at: now - 2 * HOUR }],
  }
}
