import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  KINDS,
  nearestStreet,
  normFrame,
  seed,
  spotName,
  type Bike,
  type Features,
  type Kind,
  type LatLng,
  type Spot,
  type State,
} from './data'

const KEY = 'bergenbike:v1'

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as State
  } catch {
    // Private mode or corrupt data: fall through to a fresh demo.
  }
  return seed()
}

export interface SpotDraft extends LatLng {
  kind: Kind
  features: Features
  photo?: string
}

interface Store extends State {
  confirmSpot(id: string): void
  saveSpot(draft: SpotDraft, existingId?: string): string
  saveBike(bike: Bike): void
  removeBike(): void
  reportStolen(details: { area: string; when: string; lock: string; alert: boolean }): void
  markFound(): void
  reset(): void
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      // Storage full or unavailable: the demo still works for this session.
    }
  }, [state])

  const store = useMemo<Store>(() => {
    const confirmSpot = (id: string) =>
      setState((s) => ({
        ...s,
        spots: s.spots.map((spot) =>
          spot.id === id && !spot.confirmedByMe
            ? {
                ...spot,
                verifiedAt: Date.now(),
                riders: spot.riders + 1,
                needs: Math.max(0, spot.needs - 1),
                confirmedByMe: true,
              }
            : spot,
        ),
        alerts: s.alerts.map((a) => (a.kind === 'verify' && a.spotId === id ? { ...a, done: true } : a)),
      }))

    const saveSpot = (draft: SpotDraft, existingId?: string) => {
      const now = Date.now()
      const id = existingId ?? `spot-${now}`
      const street = nearestStreet(draft)
      setState((s) => {
        const existing = s.spots.find((spot) => spot.id === existingId)
        if (existing) {
          const kindChanged = existing.kind !== draft.kind
          const updated: Spot = {
            ...existing,
            ...draft,
            photo: draft.photo ?? existing.photo,
            street,
            name: kindChanged ? spotName(draft.kind, street) : existing.name,
            tag: kindChanged ? KINDS[draft.kind].label : existing.tag,
            reasons: undefined,
            source: 'Updated by a rider',
            verifiedAt: now,
            confirmedByMe: true,
          }
          return {
            ...s,
            spots: s.spots.map((spot) => (spot.id === existing.id ? updated : spot)),
            alerts: s.alerts.map((a) => (a.kind === 'verify' && a.spotId === existing.id ? { ...a, done: true } : a)),
          }
        }
        const created: Spot = {
          ...draft,
          id,
          street,
          name: spotName(draft.kind, street),
          tag: draft.kind === 'racks' ? 'Open racks' : draft.kind === 'lockers' ? 'Locked box' : 'Guarded',
          price: 'Unknown',
          source: 'Added by you',
          verifiedAt: now,
          riders: 1,
          thefts90: 0,
          needs: 2,
          confirmedByMe: true,
        }
        return {
          ...s,
          spots: [...s.spots, created],
          alerts: [
            {
              id: `a-${now}`,
              kind: 'newspot',
              title: `New ${KINDS[draft.kind].label.toLowerCase().replace(/s$/, '')} spot added near ${street}`,
              at: now,
              spotId: id,
              mine: true,
            },
            ...s.alerts,
          ],
        }
      })
      return id
    }

    const saveBike = (bike: Bike) => setState((s) => ({ ...s, bike }))

    const withoutMyReport = (s: State) => {
      const frame = s.bike ? normFrame(s.bike.frame) : ''
      return {
        reports: s.reports.filter((r) => r.frame !== frame),
        alerts: s.alerts.filter((a) => !(a.kind === 'theft' && a.mine)),
      }
    }

    const removeBike = () => setState((s) => ({ ...s, ...withoutMyReport(s), bike: null }))

    const reportStolen: Store['reportStolen'] = ({ area, when, lock, alert }) =>
      setState((s) => {
        if (!s.bike) return s
        const now = Date.now()
        const cleared = withoutMyReport(s)
        return {
          ...s,
          bike: { ...s.bike, stolen: { at: now, area, when, lock } },
          reports: [...cleared.reports, { frame: normFrame(s.bike.frame), area, at: now }],
          alerts: alert
            ? [
                {
                  id: `a-${now}`,
                  kind: 'theft',
                  title: `Stolen bike reported near ${area}`,
                  detail: 'your report · riders nearby alerted',
                  at: now,
                  mine: true,
                },
                ...cleared.alerts,
              ]
            : cleared.alerts,
        }
      })

    const markFound = () =>
      setState((s) => (s.bike ? { ...s, ...withoutMyReport(s), bike: { ...s.bike, stolen: undefined } } : s))

    const reset = () => setState(seed())

    return { ...state, confirmSpot, saveSpot, saveBike, removeBike, reportStolen, markFound, reset }
  }, [state])

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside StoreProvider')
  return store
}

const ToastContext = createContext<(message: string) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const show = useCallback((text: string) => {
    setMessage(text)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMessage(null), 3200)
  }, [])
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-host" role="status" aria-live="polite">
        {message && (
          <div className="toast" key={message}>
            {message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
