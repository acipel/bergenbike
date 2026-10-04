import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useImperativeHandle, useRef, type Ref } from 'react'
import { KINDS, type LatLng, type Spot } from '../data'

const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

const PIN_PATH = 'M0 0C-3.2-4-5.5-6.5-5.5-9.5a5.5 5.5 0 1 1 11 0c0 3-2.3 5.5-5.5 9.5z'
const SHIELD_PATH =
  'M0 -12.6 L2.6 -11.5 V-9.6 C2.6 -8 1.5 -6.9 0 -6.2 C-1.5 -6.9 -2.6 -8 -2.6 -9.6 V-11.5Z'

function pinSvg(color: string, width: number, shield = false): string {
  const glyph = shield
    ? `<path d="${SHIELD_PATH}" fill="#fff"/>`
    : '<circle cx="0" cy="-9.5" r="2" fill="#fff"/>'
  return `<svg width="${width}" height="${(width * 17) / 13}" viewBox="-6.5 -16 13 17" aria-hidden="true"><path d="${PIN_PATH}" fill="${color}" stroke="#fff" stroke-width="1"/>${glyph}</svg>`
}

function pinIcon(spot: Spot, selected: boolean): L.DivIcon {
  const w = selected ? 50 : 36
  const h = (w * 17) / 13
  return L.divIcon({
    className: `pin${selected ? ' pin-selected' : ''}${spot.needs > 0 ? ' pin-unverified' : ''}`,
    html: pinSvg(KINDS[spot.kind].color, w, spot.kind === 'guarded'),
    iconSize: [w, h],
    iconAnchor: [w / 2, (h * 16) / 17],
  })
}

function baseMap(el: HTMLElement, center: LatLng, zoom: number, interactive = true): L.Map {
  const map = L.map(el, {
    center: [center.lat, center.lng],
    zoom,
    zoomControl: false,
    fadeAnimation: false,
    dragging: interactive,
    touchZoom: interactive,
    scrollWheelZoom: interactive,
    doubleClickZoom: interactive,
    boxZoom: interactive,
    keyboard: interactive,
  })
  map.attributionControl.setPrefix(false)
  L.tileLayer(TILES, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map)
  return map
}

export interface SpotMapHandle {
  /** Brings the given points into the area not covered by the search bar and bottom card. */
  show(points: LatLng[]): void
}

interface SpotMapProps {
  spots: Spot[]
  selectedId?: string
  user: LatLng
  onSelect(id: string): void
  ref?: Ref<SpotMapHandle>
}

export function SpotMap({ spots, selectedId, user, onSelect, ref }: SpotMapProps) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const layer = useRef<L.LayerGroup | null>(null)
  const fitted = useRef(false)
  const select = useRef(onSelect)
  select.current = onSelect

  useEffect(() => {
    const m = baseMap(el.current!, user, 17)
    layer.current = L.layerGroup().addTo(m)
    map.current = m
    return () => {
      m.remove()
      map.current = null
    }
    // The map is created once; later position changes are drawn by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useImperativeHandle(ref, () => ({
    show(points) {
      const m = map.current
      if (!m || points.length === 0) return
      m.invalidateSize()
      m.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])), {
        paddingTopLeft: [48, 150],
        paddingBottomRight: [72, 250],
        maxZoom: 17,
        animate: fitted.current,
      })
      fitted.current = true
    },
  }))

  useEffect(() => {
    const group = layer.current
    if (!group) return
    group.clearLayers()
    const selected = spots.find((s) => s.id === selectedId)
    if (selected) {
      L.polyline(
        [
          [user.lat, user.lng],
          [selected.lat, selected.lng],
        ],
        { color: '#C8400A', weight: 4, dashArray: '7 8', lineCap: 'round', interactive: false },
      ).addTo(group)
    }
    L.marker([user.lat, user.lng], {
      icon: L.divIcon({ className: 'me', html: '<span></span>', iconSize: [40, 40], iconAnchor: [20, 20] }),
      interactive: false,
      keyboard: false,
    }).addTo(group)
    for (const spot of spots) {
      const isSelected = spot.id === selectedId
      L.marker([spot.lat, spot.lng], {
        icon: pinIcon(spot, isSelected),
        title: spot.name,
        alt: `${spot.name}, ${KINDS[spot.kind].label}`,
        zIndexOffset: isSelected ? 1000 : 0,
      })
        .on('click', () => select.current(spot.id))
        .addTo(group)
    }
  }, [spots, selectedId, user])

  return <div ref={el} className="map" role="application" aria-label="Map of De Bergen with bike parking spots" />
}

interface MiniMapProps {
  center: LatLng
  color: string
  label: string
  /** When set the map can be dragged under the fixed pin and reports its new centre. */
  onMove?(center: LatLng): void
}

export function MiniMap({ center, color, label, onMove }: MiniMapProps) {
  const el = useRef<HTMLDivElement>(null)
  const move = useRef(onMove)
  move.current = onMove
  const interactive = Boolean(onMove)

  useEffect(() => {
    const m = baseMap(el.current!, center, 17, interactive)
    if (interactive) {
      m.on('moveend', () => {
        const c = m.getCenter()
        move.current?.({ lat: c.lat, lng: c.lng })
      })
    }
    return () => {
      m.remove()
    }
    // Created once with the starting centre; dragging is what moves it afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="minimap">
      <div ref={el} className="map" role="img" aria-label={`Map preview with a pin on ${label.split(' · ')[0]}`} />
      <span className="minimap-pin" dangerouslySetInnerHTML={{ __html: pinSvg(color, 34) }} />
      <span className="minimap-label">{label}</span>
    </div>
  )
}
