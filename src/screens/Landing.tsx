import { QRCodeSVG } from 'qrcode.react'
import { Link } from 'react-router-dom'
import { Icon, type IconName } from '../components/Icon'

const PIN = 'M0 0C-3.2-4-5.5-6.5-5.5-9.5a5.5 5.5 0 1 1 11 0c0 3-2.3 5.5-5.5 9.5z'

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'map',
    title: 'Secure parking map',
    text: 'Guarded storage, lockers and racks, colour-coded by security level.',
  },
  { icon: 'bike', title: 'Bike registration', text: 'Keep your frame number, a photo and a description on file.' },
  {
    icon: 'warn',
    title: 'Theft reporting',
    text: 'Report a stolen bike, alert riders nearby, and check a bike before you buy.',
  },
  { icon: 'signal', title: 'Tracker support', text: 'Connect your own GPS tracker and see your bike’s last location.' },
]

const STEPS = [
  { title: 'Listed', text: 'We start from official and open bike-parking data for the neighbourhood.' },
  {
    title: 'Checked',
    text: 'Our team walks De Bergen with a checklist: staffed, lockable, covered, lit, camera in view.',
  },
  {
    title: 'Kept current',
    text: 'Riders confirm or correct spots, and theft reports flag places where bikes go missing.',
  },
]

const SECTIONS = [
  ['features', 'What it does'],
  ['how', 'How we know'],
  ['research', 'The research'],
]

function Pin({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={PIN} fill={color} stroke="#FFFFFF" strokeWidth="1" />
      <circle cx="0" cy="-9.5" r="2" fill="#FFFFFF" />
    </g>
  )
}

function PhonePreview() {
  return (
    <div className="phone">
      <div className="phone-screen">
        <svg width="280" height="530" viewBox="0 0 146 276" role="img" aria-label="Preview of the parking map">
          <rect width="146" height="276" fill="#E8EFEC" />
          <g transform="translate(0 34)" fontFamily="inherit" fontWeight="700" fill="#6F8186">
            <path d="M72 142 L100 138 L103 170 L75 174Z" fill="#CBE3CF" />
            <path d="M150 -40 C126 60 146 130 130 260" stroke="#BCD7E8" strokeWidth="10" fill="none" />
            <path
              d="M0 55 L146 42 M0 150 L146 138 M33 -40 L12 251 M87 -40 L96 260 M0 5 L146 -8 M0 215 L146 204"
              stroke="#FFFFFF"
              strokeWidth="3.2"
              fill="none"
            />
            <path
              d="M3 -40 L18 0 L62 120 L74 251 M102 -40 L116 260 M0 104 L146 90"
              stroke="#FFFFFF"
              strokeWidth="7"
              fill="none"
              strokeLinejoin="round"
            />
            <text x="30" y="30" transform="rotate(70 30 30)" fontSize="5">
              Kleine Berg
            </text>
            <text x="108" y="112" transform="rotate(87 108 112)" fontSize="5">
              Grote Berg
            </text>
            <path
              d="M40 147 L64 145 L61.5 124"
              stroke="#C8400A"
              strokeWidth="1.6"
              strokeDasharray="2.5 2"
              fill="none"
              strokeLinecap="round"
            />
            <Pin x={106} y={40} color="#3B8FC0" />
            <Pin x={109} y={92} color="#3B8FC0" />
            <Pin x={38} y={52} color="#8FA6AB" />
            <Pin x={84} y={96} color="#8FA6AB" />
            <g transform="translate(61.5 119) scale(1.4)">
              <path d={PIN} fill="#00798C" stroke="#FFFFFF" strokeWidth="0.9" />
              <path
                d="M0 -12.6 L2.6 -11.5 V-9.6 C2.6 -8 1.5 -6.9 0 -6.2 C-1.5 -6.9 -2.6 -8 -2.6 -9.6 V-11.5Z"
                fill="#FFFFFF"
              />
            </g>
            <circle cx="40" cy="147" r="7.5" fill="#2F7FD6" opacity="0.18" />
            <circle cx="40" cy="147" r="3.2" fill="#2F7FD6" stroke="#FFFFFF" strokeWidth="1.2" />
          </g>
        </svg>
        <div className="phone-notch">
          <div />
        </div>
        <div className="phone-card">
          <strong>Guarded storage Kleine Berg</strong>
          <span>180 m · 3 min walk · Verified 3 days ago</span>
          <div>Navigate</div>
        </div>
      </div>
    </div>
  )
}

export function Landing() {
  const url = `${window.location.origin}${window.location.pathname}`
  const shown = url.replace(/^https?:\/\//, '').replace(/\/$/, '')

  return (
    <div className="landing">
      <header className="l-wrap l-header">
        <div className="l-brand">
          <div className="l-logo">
            <Icon name="bike" size={26} />
          </div>
          <span>BergenBike</span>
        </div>
        <nav aria-label="Page">
          {SECTIONS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => {
                // Plain hash links would be read as routes by the hash router.
                e.preventDefault()
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              {label}
            </a>
          ))}
        </nav>
      </header>

      <section className="l-hero">
        <div className="l-wrap l-hero-inner">
          <div className="l-hero-copy">
            <div className="l-tag">Concept app · TU/e Team 19</div>
            <h1>Park safe. Ride easy.</h1>
            <p>
              Finding safe parking, reporting a theft, or recognising a stolen bike shouldn’t be guesswork. BergenBike
              puts all three in one place for De Bergen, Eindhoven.
            </p>

            <div className="l-qr-card">
              <div className="l-qr">
                <QRCodeSVG value={url} size={100} fgColor="#13262B" bgColor="#FFFFFF" title="QR code to open BergenBike on your phone" />
              </div>
              <div className="l-qr-copy">
                <h2>Made for your phone</h2>
                <p>
                  Scan the code with your phone camera, or open <a href={url}>{shown}</a> in your mobile browser.
                  Nothing to install.
                </p>
                <Link to="/map" className="l-cta">
                  Already on your phone? Open the app
                  <Icon name="arrow" size={18} sw={2.2} />
                </Link>
              </div>
            </div>
          </div>
          <div className="l-hero-phone">
            <PhonePreview />
          </div>
        </div>
      </section>

      <section id="features" className="l-wrap l-section">
        <h2>What it does</h2>
        <div className="l-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="l-feature">
              <div className="l-feature-icon">
                <Icon name={f.icon} size={26} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="l-wrap l-section l-how">
        <div className="l-intro">
          <h2>How do we know a spot is secure?</h2>
          <p>
            A rating describes what is physically at the spot. Every spot shows why it has its level, where the
            information came from and when it was last checked.
          </p>
        </div>
        <div className="l-grid">
          {STEPS.map((step, i) => (
            <div key={step.title} className="l-step">
              <div className="l-num">{i + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="research" className="l-research">
        <div className="l-wrap">
          <blockquote>
            “What worries me more is the bike theft.”<span>— De Bergen resident</span>
          </blockquote>
          <div>
            <p className="l-stat">Based on 14 interviews and 10.5 hours of observation in De Bergen.</p>
            <p>BergenBike works alongside secure physical parking in the neighbourhood. It does not replace it.</p>
          </div>
        </div>
      </section>

      <footer className="l-wrap l-footer">
        <span>TU/e · Team 19 · De Bergen research</span>
        <span>Student concept, not an official service</span>
      </footer>
    </div>
  )
}
