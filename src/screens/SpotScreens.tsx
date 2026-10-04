import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { MiniMap } from '../components/Maps'
import { PhotoButton, Screen } from '../components/Screen'
import {
  DEMO_LOCATION,
  FEATURES,
  KINDS,
  KIND_ORDER,
  ago,
  cap,
  directionsUrl,
  distance,
  formatDistance,
  nearestStreet,
  reasonsFor,
  type Features,
  type Kind,
  type LatLng,
} from '../data'
import { useStore, useToast } from '../store'

export function SpotScreen() {
  const { id } = useParams()
  const { spots, confirmSpot } = useStore()
  const toast = useToast()
  const spot = spots.find((s) => s.id === id)
  if (!spot) return <Navigate to="/map" replace />
  const kind = KINDS[spot.kind]

  return (
    <Screen title="Spot details" back={{ to: `/map?spot=${spot.id}`, label: 'Back to map' }}>
      <div className="stack-6">
        <div className="row gap-8 wrap">
          <span className="badge" style={{ background: kind.color }}>
            <Icon name="shield" size={14} sw={2.2} />
            {kind.label}
          </span>
          <span className="meta">{spot.needs > 0 ? 'Unverified spot' : kind.level}</span>
        </div>
        <h2 className="title">{spot.name}</h2>
        <div className="sub lg">
          {formatDistance(distance(DEMO_LOCATION, spot))} · {spot.price}
        </div>
      </div>

      {spot.photo && <img className="spot-photo" src={spot.photo} alt={`Photo of ${spot.name}`} />}

      <section className="card stack-9">
        <h3>Why this rating</h3>
        {reasonsFor(spot).map((reason) => (
          <div key={reason.text} className={reason.ok ? 'reason' : 'reason off'}>
            <Icon name={reason.ok ? 'check' : 'minus'} size={18} sw={reason.ok ? 2.6 : 2.4} />
            {reason.text}
          </div>
        ))}
      </section>

      <section className="card stack-10">
        <h3>How we know</h3>
        <div className="kv">
          <span>Source</span>
          <strong>{spot.source}</strong>
        </div>
        <div className="kv">
          <span>Last verified</span>
          <strong>
            {ago(spot.verifiedAt)} · {spot.riders} {spot.riders === 1 ? 'rider' : 'riders'}
          </strong>
        </div>
        <div className="kv">
          <span>Thefts reported, 90 days</span>
          <strong>{spot.thefts90}</strong>
        </div>
        {spot.needs > 0 && (
          <div className="kv">
            <span>Status</span>
            <strong>
              Needs {spot.needs} more {spot.needs === 1 ? 'confirmation' : 'confirmations'}
            </strong>
          </div>
        )}
        <div className="note">A rating describes what is at the spot. It is not a guarantee.</div>
      </section>

      <section className="card soft stack-10">
        <h3>Is this still accurate?</h3>
        <div className="row gap-10">
          <button
            className="btn btn-teal sm grow"
            disabled={spot.confirmedByMe}
            onClick={() => {
              confirmSpot(spot.id)
              toast('Thanks. This spot is marked as checked today.')
            }}
          >
            {spot.confirmedByMe ? 'Confirmed' : 'Yes, confirm'}
          </button>
          <Link to={`/add?spot=${spot.id}`} className="btn btn-outline sm grow">
            Report a change
          </Link>
        </div>
      </section>

      <a className="btn btn-yellow lg" href={directionsUrl(spot)} target="_blank" rel="noreferrer">
        <Icon name="navigate" size={18} sw={2.2} />
        Navigate here
      </a>
    </Screen>
  )
}

const NO_FEATURES: Features = { frame: false, covered: false, lit: false, camera: false, staffed: false }

export function AddSpotScreen() {
  const { spots, saveSpot } = useStore()
  const toast = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const existing = spots.find((s) => s.id === params.get('spot'))

  const [center, setCenter] = useState<LatLng>(existing ?? DEMO_LOCATION)
  const [kind, setKind] = useState<Kind>(existing?.kind ?? 'racks')
  const [features, setFeatures] = useState<Features>(existing?.features ?? NO_FEATURES)
  const [photo, setPhoto] = useState<string | undefined>(existing?.photo)

  const submit = () => {
    const id = saveSpot({ ...center, kind, features, photo }, existing?.id)
    toast(existing ? 'Thanks. The spot has been updated.' : 'Spot added. It shows as unverified for now.')
    navigate(`/map?spot=${id}`)
  }

  return (
    <Screen
      title="Add or update a spot"
      back={existing ? { to: `/spot/${existing.id}`, label: 'Back to spot details' } : { to: '/map', label: 'Back to map' }}
    >
      <div className="stack-6">
        <div className="label">Where is it?</div>
        <MiniMap
          center={center}
          color="#C8400A"
          label={`${nearestStreet(center)} · move the map to adjust`}
          onMove={setCenter}
        />
      </div>

      <fieldset>
        <legend>What kind of parking?</legend>
        <div className="kinds">
          {KIND_ORDER.map((k) => (
            <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}>
              <span className="dot lg" style={{ background: KINDS[k].color }} />
              {KINDS[k].label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>What do you see there?</legend>
        <div className="card checks">
          {FEATURES.map((f) => (
            <label key={f.key} htmlFor={`f-${f.key}`}>
              <input
                id={`f-${f.key}`}
                type="checkbox"
                checked={features[f.key]}
                onChange={(e) => setFeatures((v) => ({ ...v, [f.key]: e.target.checked }))}
              />
              {f.yes}
            </label>
          ))}
        </div>
      </fieldset>

      <PhotoButton photo={photo} onPhoto={setPhoto} label="Add a photo" />

      <div className="note">
        {existing
          ? `${cap(ago(existing.verifiedAt))} was the last check. Your update is shown to other riders straight away.`
          : 'New spots show as “unverified” until two other riders confirm them.'}
      </div>

      <button className="btn btn-yellow lg" onClick={submit}>
        {existing ? 'Submit update' : 'Submit spot'}
      </button>
    </Screen>
  )
}
