import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Screen } from '../components/Screen'
import { ago, cap, type Alert, type Spot } from '../data'
import { useStore, useToast } from '../store'

function detail(alert: Alert, spot?: Spot): string {
  if (alert.kind === 'verify' && spot) {
    return alert.done
      ? `Checked ${ago(spot.verifiedAt)} · thank you`
      : `Last checked ${ago(spot.verifiedAt)}${alert.detail ? ` · ${alert.detail}` : ''}`
  }
  if (alert.kind === 'newspot' && spot) {
    const status =
      spot.needs > 0
        ? `unverified, needs ${spot.needs} more ${spot.needs === 1 ? 'confirmation' : 'confirmations'}`
        : 'now verified'
    return `${cap(ago(alert.at))} · ${status}`
  }
  return cap(ago(alert.at)) + (alert.detail ? ` · ${alert.detail}` : '')
}

export function AlertsScreen() {
  const { alerts, spots, bike, confirmSpot, markFound, reset } = useStore()
  const toast = useToast()
  const sorted = [...alerts].sort((a, b) => Number(b.kind === 'theft') - Number(a.kind === 'theft') || b.at - a.at)

  return (
    <Screen title="Alerts">
      <h2 className="overline">YOUR BIKE</h2>
      {!bike ? (
        <section className="card row">
          <span className="round teal">
            <Icon name="bike" size={22} sw={1.9} />
          </span>
          <div className="stack-3 grow">
            <strong className="item-title">No bike registered</strong>
            <span className="sub">Register your bike to get alerts about it.</span>
          </div>
          <Link to="/bike/edit" className="btn btn-outline sm">
            Register
          </Link>
        </section>
      ) : bike.stolen ? (
        <section className="banner bad col">
          <div className="row">
            <span className="round white">
              <Icon name="warn" size={22} sw={1.9} />
            </span>
            <div className="stack-3">
              <strong>Your bike is reported stolen</strong>
              <span>
                Near {bike.stolen.area}, {ago(bike.stolen.at)}
                {bike.tracker ? ' · tracker seen 2 min ago' : ''}
              </span>
            </div>
          </div>
          <button
            className="btn btn-danger sm"
            onClick={() => {
              markFound()
              toast('Good news. Your theft report has been withdrawn.')
            }}
          >
            I found my bike
          </button>
        </section>
      ) : (
        <section className="banner good">
          <span className="round white">
            <Icon name={bike.tracker ? 'signal' : 'check'} size={22} sw={1.9} />
          </span>
          <div className="stack-3">
            <strong>{bike.tracker ? 'Your bike is where you parked it' : 'No theft report for your bike'}</strong>
            <span>{bike.tracker ? 'Tracker seen 2 min ago' : 'Link a tracker to follow its location'}</span>
          </div>
        </section>
      )}

      <h2 className="overline spaced">IN DE BERGEN</h2>
      {sorted.map((alert) => {
        const spot = spots.find((s) => s.id === alert.spotId)
        if (alert.kind === 'verify' && spot) {
          return (
            <section key={alert.id} className="card stack-12">
              <div className="row top">
                <span className="round teal">
                  <Icon name="pinCheck" size={22} sw={1.9} />
                </span>
                <div className="stack-3">
                  <strong className="item-title">{alert.done ? spot.name : alert.title}</strong>
                  <span className="sub">{detail(alert, spot)}</span>
                </div>
              </div>
              {!alert.done && (
                <div className="row gap-10">
                  <button
                    className="btn btn-teal sm grow"
                    onClick={() => {
                      confirmSpot(spot.id)
                      toast('Thanks. This spot is marked as checked today.')
                    }}
                  >
                    Yes, confirm
                  </button>
                  <Link to={`/add?spot=${spot.id}`} className="btn btn-outline sm grow">
                    Something changed
                  </Link>
                </div>
              )}
            </section>
          )
        }
        const body = (
          <>
            <span className={alert.kind === 'theft' ? 'round red' : 'round amber'}>
              <Icon name={alert.kind === 'theft' ? 'warn' : 'plus'} size={22} sw={alert.kind === 'theft' ? 1.9 : 2} />
            </span>
            <div className="stack-3">
              <strong className="item-title">{alert.title}</strong>
              <span className="sub">{detail(alert, spot)}</span>
            </div>
          </>
        )
        return spot ? (
          <Link key={alert.id} to={`/spot/${spot.id}`} className="card row top link-card">
            {body}
          </Link>
        ) : (
          <section key={alert.id} className="card row top">
            {body}
          </section>
        )
      })}

      <div className="grow" />
      <button
        className="btn-text"
        onClick={() => {
          reset()
          toast('Demo data reset.')
        }}
      >
        Reset demo data
      </button>
    </Screen>
  )
}
