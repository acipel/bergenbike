import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { SpotMap, type SpotMapHandle } from '../components/Maps'
import {
  BERGEN_CENTER,
  DEMO_LOCATION,
  KINDS,
  KIND_ORDER,
  ago,
  directionsUrl,
  distance,
  formatDistance,
  type Kind,
  type LatLng,
  type Spot,
} from '../data'
import { useStore, useToast } from '../store'

/** The closest spot of the most secure kind that is still switched on. */
function recommend(spots: Spot[], user: LatLng): Spot | undefined {
  for (const kind of KIND_ORDER) {
    const ofKind = spots.filter((s) => s.kind === kind && s.needs === 0)
    if (ofKind.length) return ofKind.reduce((a, b) => (distance(user, a) <= distance(user, b) ? a : b))
  }
  return spots[0]
}

export function MapScreen() {
  const { spots } = useStore()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const map = useRef<SpotMapHandle>(null)
  const [user, setUser] = useState<LatLng>(DEMO_LOCATION)
  const [shown, setShown] = useState<Record<Kind, boolean>>({ guarded: true, lockers: true, racks: true })
  const [picked, setPicked] = useState<string | null>(params.get('spot'))
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)

  const visible = useMemo(() => spots.filter((s) => shown[s.kind]), [spots, shown])
  const suggestion = useMemo(() => recommend(visible, user), [visible, user])
  const selected = visible.find((s) => s.id === picked) ?? suggestion
  const isSuggestion = selected?.id === suggestion?.id

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return spots.filter((s) => `${s.name} ${s.street} ${KINDS[s.kind].label}`.toLowerCase().includes(q)).slice(0, 5)
  }, [query, spots])

  useEffect(() => {
    if (selected) map.current?.show([user, selected])
    // Refit only when the selection or the rider's position changes, not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, user])

  const pick = (id: string) => {
    setPicked(id)
    if (params.has('spot')) setParams({}, { replace: true })
  }

  const locate = () => {
    if (!navigator.geolocation) {
      setUser(DEMO_LOCATION)
      toast('Location is not available. Showing a demo location.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        if (distance(here, BERGEN_CENTER) > 1500) {
          setUser({ ...DEMO_LOCATION })
          toast('You are outside De Bergen. Showing a demo location.')
        } else {
          setUser(here)
        }
      },
      () => {
        setUser({ ...DEMO_LOCATION })
        toast('Could not get your location. Showing a demo location.')
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  return (
    <main className="screen map-screen">
      <SpotMap ref={map} spots={visible} selectedId={selected?.id} user={user} onSelect={pick} />

      <div className="map-top">
        <div className="search">
          <Icon name="search" size={20} sw={2} />
          <label htmlFor="map-search" className="sr-only">
            Search a street or place
          </label>
          <input
            id="map-search"
            type="search"
            placeholder="Search a street or place"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearching(true)}
            onBlur={() => window.setTimeout(() => setSearching(false), 150)}
          />
        </div>
        {searching && query.trim() ? (
          <ul className="results">
            {results.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => {
                    setShown((v) => ({ ...v, [s.kind]: true }))
                    pick(s.id)
                    setQuery('')
                  }}
                >
                  <span className="dot" style={{ background: KINDS[s.kind].color }} />
                  <span>
                    <strong>{s.name}</strong>
                    <small>{formatDistance(distance(user, s))}</small>
                  </span>
                </button>
              </li>
            ))}
            {results.length === 0 && <li className="empty">No parking spots match “{query.trim()}”.</li>}
          </ul>
        ) : (
          <div className="chips">
            {KIND_ORDER.map((kind) => (
              <button
                key={kind}
                className="chip"
                aria-pressed={shown[kind]}
                onClick={() => setShown((v) => ({ ...v, [kind]: !v[kind] }))}
              >
                <span className="dot" style={{ background: KINDS[kind].color }} />
                {KINDS[kind].label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="map-bottom">
        <div className="fabs">
          <Link to="/add" aria-label="Add a parking spot" className="fab fab-teal">
            <Icon name="plus" sw={2} />
          </Link>
          <button aria-label="Centre on my location" className="fab" onClick={locate}>
            <Icon name="locate" />
          </button>
        </div>

        {selected ? (
          <section className="sheet" aria-live="polite">
            <div className="row">
              <div className="tile" style={{ color: KINDS[selected.kind].color }}>
                <Icon name={selected.kind === 'guarded' ? 'shieldCheck' : 'pin'} />
              </div>
              <div className="stack-2">
                <div className="eyebrow">{isSuggestion ? `Nearest ${KINDS[selected.kind].noun}` : 'Selected spot'}</div>
                <div className="sheet-title">{selected.name}</div>
                <div className="sub">{formatDistance(distance(user, selected))}</div>
              </div>
            </div>
            <div className="row gap-10 wrap">
              <span className="pill">{selected.tag}</span>
              {selected.needs > 0 ? (
                <span className="meta">
                  <Icon name="minus" size={14} sw={2.6} />
                  Unverified
                </span>
              ) : (
                <span className="meta">
                  <Icon name="check" size={14} sw={2.6} className="ok" />
                  Verified {ago(selected.verifiedAt)}
                </span>
              )}
            </div>
            <div className="row gap-10">
              <a className="btn btn-yellow grow" href={directionsUrl(selected)} target="_blank" rel="noreferrer">
                <Icon name="navigate" size={18} sw={2.2} />
                Navigate
              </a>
              <Link to={`/spot/${selected.id}`} className="btn btn-outline why">
                Why this spot?
              </Link>
            </div>
          </section>
        ) : (
          <section className="sheet">
            <div className="sheet-title">No spots to show</div>
            <div className="sub">Switch a filter back on to see parking spots.</div>
          </section>
        )}
      </div>
    </main>
  )
}
