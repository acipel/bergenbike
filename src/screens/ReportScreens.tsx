import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { MiniMap } from '../components/Maps'
import { Field, Screen } from '../components/Screen'
import {
  DEMO_LOCATION,
  SAMPLE_FRAME,
  SAMPLE_STOLEN_FRAME,
  ago,
  bikeName,
  cap,
  nearestStreet,
  normFrame,
  type LatLng,
} from '../data'
import { useStore, useToast } from '../store'

/** Where the demo tracker last reported the bike. */
const TRACKER_LOCATION: LatLng = { lat: 51.43625, lng: 5.47445 }
const LOCKS = ['Chain lock to a rack', 'Frame lock only', 'Chain and frame lock', 'Not locked']

export function ReportScreen() {
  const { alerts, bike } = useStore()
  const latest = alerts.filter((a) => a.kind === 'theft').sort((a, b) => b.at - a.at)[0]

  return (
    <Screen title="Report & check">
      <Link to="/report/stolen" className="hero-card danger">
        <span className="hero-icon">
          <Icon name="warn" size={28} sw={1.9} />
        </span>
        <span className="stack-4">
          <strong>{bike?.stolen ? 'Update my theft report' : 'Report my bike stolen'}</strong>
          <span>Shares frame number and last location</span>
        </span>
      </Link>
      <Link to="/check" className="hero-card">
        <span className="hero-icon">
          <Icon name="scan" size={28} sw={1.9} />
        </span>
        <span className="stack-4">
          <strong>Check a bike</strong>
          <span>Scan frame number or QR</span>
        </span>
      </Link>

      <div className="section-head">
        <h2 className="overline">NEARBY ALERTS</h2>
        <Link to="/alerts">View all</Link>
      </div>
      {latest ? (
        <section className="card row top">
          <span className="round amber">
            <Icon name="bell" size={22} sw={1.9} />
          </span>
          <div className="stack-4">
            <strong className="item-title">{latest.title}</strong>
            <span className="sub">{cap(ago(latest.at))}</span>
          </div>
        </section>
      ) : (
        <section className="card">
          <span className="sub">No thefts reported nearby.</span>
        </section>
      )}
    </Screen>
  )
}

export function ReportStolenScreen() {
  const { bike, reportStolen } = useStore()
  const toast = useToast()
  const navigate = useNavigate()
  const [where, setWhere] = useState<LatLng>(bike?.tracker ? TRACKER_LOCATION : DEMO_LOCATION)
  const [when, setWhen] = useState(bike?.stolen?.when ?? '')
  const [lock, setLock] = useState(bike?.stolen?.lock ?? LOCKS[0])
  const [alert, setAlert] = useState(true)

  if (!bike) {
    return (
      <Screen title="Report stolen" back={{ to: '/report', label: 'Back to report and check' }}>
        <div className="empty-state">
          <div className="tile xl">
            <Icon name="bike" size={40} sw={1.4} />
          </div>
          <h2 className="title">Register your bike first</h2>
          <p className="sub lg">A theft report needs a frame number, so other riders and buyers can recognise the bike.</p>
          <Link to="/bike/edit" className="btn btn-yellow lg">
            Register your bike
          </Link>
        </div>
      </Screen>
    )
  }

  const area = nearestStreet(where)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    reportStolen({ area, when: when.trim(), lock, alert })
    toast(alert ? 'Bike reported stolen. Riders nearby are alerted.' : 'Bike reported stolen.')
    navigate('/alerts')
  }

  return (
    <Screen title="Report stolen" back={{ to: '/report', label: 'Back to report and check' }}>
      <form className="form" onSubmit={submit}>
        <section className="card row tight">
          <div className="tile grey">
            {bike.photo ? <img src={bike.photo} alt="" /> : <Icon name="bike" size={30} sw={1.5} />}
          </div>
          <div className="stack-2">
            <strong className="item-title">{bikeName(bike)}</strong>
            <span className="sub">Frame no. {bike.frame}</span>
          </div>
        </section>

        <div className="stack-6">
          <div className="label">Where was it parked?</div>
          <MiniMap
            center={where}
            color="#C62828"
            label={`${area} · ${
              bike.tracker && where === TRACKER_LOCATION ? 'tracker’s last location' : 'move the map to adjust'
            }`}
            onMove={setWhere}
          />
        </div>

        <Field id="s-when" label="When did you last see it?">
          <input
            id="s-when"
            type="text"
            className="input"
            placeholder="Today, 08:30"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
          />
        </Field>

        <Field id="s-lock" label="How was it locked?">
          <select id="s-lock" className="input" value={lock} onChange={(e) => setLock(e.target.value)}>
            {LOCKS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </Field>

        <label htmlFor="s-alert" className="card check-card">
          <input id="s-alert" type="checkbox" checked={alert} onChange={(e) => setAlert(e.target.checked)} />
          <span>
            <strong>Alert riders nearby</strong>
            <br />
            <span className="muted">Shares the area and bike description, not your name</span>
          </span>
        </label>

        <div className="note">This does not replace a police report. Please file one as well.</div>
        <div className="grow" />
        <button type="submit" className="btn btn-danger lg">
          {bike.stolen ? 'Update theft report' : 'Report bike stolen'}
        </button>
      </form>
    </Screen>
  )
}

export function CheckScreen() {
  const { reports } = useStore()
  const toast = useToast()
  const [frame, setFrame] = useState('')
  const [checked, setChecked] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const check = (value: string) => {
    if (normFrame(value).length < 4) {
      setChecked(null)
      setError('Enter the frame number you want to check.')
      return
    }
    setError('')
    setSent(false)
    setChecked(value.trim().toUpperCase())
  }
  const report = checked ? reports.find((r) => r.frame === normFrame(checked)) : undefined

  return (
    <Screen title="Check a bike" back={{ to: '/report', label: 'Back to report and check' }}>
      <p className="lead">
        Buying second-hand, or seen a bike that looks abandoned? Check its frame number before you act.
      </p>

      <button
        className="scan-btn"
        onClick={() => {
          setFrame(SAMPLE_STOLEN_FRAME)
          check(SAMPLE_STOLEN_FRAME)
          toast('Demo scan: read a sample frame number.')
        }}
      >
        <Icon name="scan" size={44} sw={1.6} />
        Scan frame number or QR
      </button>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          check(frame)
        }}
      >
        <Field id="c-frame" label="Or type the frame number" error={error}>
          <div className="row gap-8">
            <input
              id="c-frame"
              type="text"
              className="input grow"
              placeholder={SAMPLE_FRAME}
              autoCapitalize="characters"
              autoComplete="off"
              value={frame}
              aria-invalid={Boolean(error)}
              onChange={(e) => {
                setFrame(e.target.value)
                setError('')
              }}
            />
            <button type="submit" className="btn btn-yellow check">
              Check
            </button>
          </div>
        </Field>
      </form>

      <div aria-live="polite" className="stack-14">
        {checked && report && (
          <section className="result bad">
            <div className="result-head">
              <Icon name="warn" size={26} sw={2} />
              <span>Reported stolen</span>
            </div>
            <div className="result-body">
              Frame no. <strong>{checked}</strong> was reported stolen near {report.area}, {ago(report.at)}.
            </div>
            <div className="result-note">
              Don’t buy this bike and don’t confront anyone. You can let the owner know where you saw it.
            </div>
            <button
              className="btn btn-danger"
              disabled={sent}
              onClick={() => {
                setSent(true)
                toast('Location sent to the owner. Thank you.')
              }}
            >
              {sent ? 'Location sent' : 'Send location to the owner'}
            </button>
          </section>
        )}
        {checked && !report && (
          <section className="result good">
            <div className="result-head">
              <Icon name="check" size={26} sw={2.4} />
              <span>No theft report found</span>
            </div>
            <div className="result-body">
              Frame no. <strong>{checked}</strong> has not been reported stolen in BergenBike.
            </div>
            <div className="result-note">This is not a guarantee. Ask the seller for proof of purchase.</div>
          </section>
        )}
      </div>
    </Screen>
  )
}
