import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Field, PhotoButton, Screen } from '../components/Screen'
import { SAMPLE_FRAME, ago, bikeName, swatch } from '../data'
import { useStore, useToast } from '../store'

export function MyBikeScreen() {
  const { bike, markFound } = useStore()
  const toast = useToast()

  if (!bike) {
    return (
      <Screen title="My bike">
        <div className="empty-state">
          <div className="tile xl">
            <Icon name="bike" size={40} sw={1.4} />
          </div>
          <h2 className="title">No bike registered yet</h2>
          <p className="sub lg">
            Keep your frame number, a photo and a description on file, so you have them ready if your bike is ever
            stolen.
          </p>
          <Link to="/bike/edit" className="btn btn-yellow lg">
            Register your bike
          </Link>
        </div>
      </Screen>
    )
  }

  const colour = swatch(bike.colour)
  return (
    <Screen
      title="My bike"
      action={
        <Link to="/bike/edit" aria-label="Edit bike details" className="icon-btn">
          <Icon name="edit" size={22} />
        </Link>
      }
    >
      <div className={bike.photo ? 'bike-photo has-photo' : 'bike-photo'}>
        {bike.photo ? (
          <img src={bike.photo} alt="Your bike" />
        ) : (
          <>
            <Icon name="bike" size={72} sw={1.2} />
            <span>Bike photo</span>
          </>
        )}
        {bike.stolen ? (
          <span className="stamp danger">
            <Icon name="warn" size={14} sw={2.4} />
            Reported stolen
          </span>
        ) : (
          <span className="stamp">
            <Icon name="check" size={14} sw={2.8} />
            Registered
          </span>
        )}
      </div>

      <div className="stack-2">
        <h2 className="title">{bikeName(bike)}</h2>
        <div className="sub lg">
          {bike.stolen ? `Reported stolen near ${bike.stolen.area}, ${ago(bike.stolen.at)}` : 'Registered to you'}
        </div>
      </div>

      {bike.tracker ? (
        <section className="banner good">
          <span className="pulse">
            <span />
          </span>
          <div className="stack-2 grow">
            <strong>Tracker connected</strong>
            <span>GPS tracker · seen 2 min ago</span>
          </div>
          <Icon name="signal" size={26} />
        </section>
      ) : (
        <section className="card row">
          <div className="tile">
            <Icon name="signal" />
          </div>
          <div className="stack-2 grow">
            <strong className="label">No tracker linked</strong>
            <span className="note">Link your own GPS tracker to see your bike’s last location.</span>
          </div>
          <Link to="/bike/edit" className="btn btn-outline sm">
            Add
          </Link>
        </section>
      )}

      <section className="card facts">
        <div>
          <span>FRAME NUMBER</span>
          <strong className="mono">{bike.frame}</strong>
        </div>
        <div>
          <span>BRAND</span>
          <strong>{bike.brand || 'Not filled in'}</strong>
        </div>
        <div className="with-swatch">
          <div>
            <span>COLOUR</span>
            <strong>{bike.colour || 'Not filled in'}</strong>
          </div>
          {colour && <i style={{ background: colour }} />}
        </div>
      </section>

      <div className="grow" />
      {bike.stolen ? (
        <button
          className="btn btn-teal lg"
          onClick={() => {
            markFound()
            toast('Good news. Your theft report has been withdrawn.')
          }}
        >
          I found my bike
        </button>
      ) : (
        <Link to="/report/stolen" className="btn btn-danger-outline lg">
          Report this bike stolen
        </Link>
      )}
    </Screen>
  )
}

export function RegisterScreen() {
  const { bike, saveBike, removeBike } = useStore()
  const toast = useToast()
  const navigate = useNavigate()
  const [photo, setPhoto] = useState(bike?.photo)
  const [frame, setFrame] = useState(bike?.frame ?? '')
  const [brand, setBrand] = useState(bike?.brand ?? '')
  const [colour, setColour] = useState(bike?.colour ?? '')
  const [tracker, setTracker] = useState<'off' | 'connecting' | 'on'>(bike?.tracker ? 'on' : 'off')
  const [error, setError] = useState('')

  const save = (e: FormEvent) => {
    e.preventDefault()
    if (frame.replace(/\s/g, '').length < 4) {
      setError('Enter the frame number stamped into your bike.')
      document.getElementById('r-frame')?.focus()
      return
    }
    saveBike({
      name: bike && bike.colour === colour.trim() ? bike.name : undefined,
      frame: frame.trim().toUpperCase(),
      brand: brand.trim(),
      colour: colour.trim(),
      photo,
      tracker: tracker === 'on',
      stolen: bike?.stolen,
    })
    toast(bike ? 'Bike profile saved.' : 'Your bike is registered.')
    navigate('/bike')
  }

  const toggleTracker = () => {
    if (tracker === 'on') return setTracker('off')
    setTracker('connecting')
    window.setTimeout(() => setTracker('on'), 1200)
  }

  return (
    <Screen title={bike ? 'Edit bike details' : 'Register your bike'} back={{ to: '/bike', label: 'Back to my bike' }}>
      <form className="form" onSubmit={save} noValidate>
        <PhotoButton photo={photo} onPhoto={setPhoto} label="Add a photo of your bike" tall />

        <Field
          id="r-frame"
          label="Frame number"
          error={error}
          hint="Stamped into the frame, often near the pedals or under the saddle."
        >
          <div className="row gap-8">
            <input
              id="r-frame"
              type="text"
              className="input grow"
              placeholder={`e.g. ${SAMPLE_FRAME}`}
              autoCapitalize="characters"
              autoComplete="off"
              value={frame}
              aria-invalid={Boolean(error)}
              onChange={(e) => {
                setFrame(e.target.value)
                setError('')
              }}
            />
            <button
              type="button"
              className="btn btn-teal square"
              aria-label="Scan frame number with camera"
              onClick={() => {
                setFrame(SAMPLE_FRAME)
                setError('')
                toast('Demo scan: frame number filled in.')
              }}
            >
              <Icon name="scan" />
            </button>
          </div>
        </Field>

        <Field id="r-brand" label="Brand and model">
          <input
            id="r-brand"
            type="text"
            className="input"
            placeholder="e.g. City Classic 7-speed"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </Field>

        <Field id="r-colour" label="Colour">
          <input
            id="r-colour"
            type="text"
            className="input"
            placeholder="e.g. Dark green"
            value={colour}
            onChange={(e) => setColour(e.target.value)}
          />
        </Field>

        <section className="card row">
          <div className="tile">
            <Icon name="signal" />
          </div>
          <div className="stack-2 grow">
            <span className="label">Tracker (optional)</span>
            <span className="note">{tracker === 'on' ? 'GPS tracker linked' : 'Link your own GPS tracker'}</span>
          </div>
          <button
            type="button"
            className={tracker === 'on' ? 'btn btn-teal sm' : 'btn btn-outline sm'}
            disabled={tracker === 'connecting'}
            onClick={toggleTracker}
          >
            {tracker === 'on' ? 'Connected' : tracker === 'connecting' ? 'Connecting…' : 'Connect'}
          </button>
        </section>

        <div className="grow" />
        <div className="note">Your frame number is only used to match theft reports and checks.</div>
        <button type="submit" className="btn btn-yellow lg">
          Save bike profile
        </button>
        {bike && (
          <button
            type="button"
            className="btn-text danger"
            onClick={() => {
              removeBike()
              toast('Bike removed from this phone.')
              navigate('/bike')
            }}
          >
            Remove this bike
          </button>
        )}
      </form>
    </Screen>
  )
}
