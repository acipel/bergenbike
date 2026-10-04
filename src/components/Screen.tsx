import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon, type IconName } from './Icon'

interface ScreenProps {
  title: string
  back?: { to: string; label: string }
  action?: ReactNode
  children: ReactNode
}

export function Screen({ title, back, action, children }: ScreenProps) {
  return (
    <>
      <header className={back ? 'bar bar-back' : 'bar'}>
        {back && (
          <Link to={back.to} aria-label={back.label} className="icon-btn">
            <Icon name="back" sw={2} />
          </Link>
        )}
        <h1>{title}</h1>
        {action}
      </header>
      <main className="screen">{children}</main>
    </>
  )
}

const TABS: { to: string; label: string; icon: IconName; section: RegExp }[] = [
  { to: '/map', label: 'Map', icon: 'pin', section: /^\/(map|spot|add)/ },
  { to: '/bike', label: 'My bike', icon: 'bike', section: /^\/bike/ },
  { to: '/report', label: 'Report', icon: 'shieldAlert', section: /^\/(report|check)/ },
  { to: '/alerts', label: 'Alerts', icon: 'bell', section: /^\/alerts/ },
]

export function TabBar() {
  const { pathname } = useLocation()
  return (
    <nav aria-label="Main" className="tabs">
      {TABS.map((tab) => (
        <Link key={tab.to} to={tab.to} aria-current={tab.section.test(pathname) ? 'page' : undefined}>
          <Icon name={tab.icon} />
          {tab.label}
        </Link>
      ))}
    </nav>
  )
}

export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <div className="error" role="alert">
          {error}
        </div>
      ) : (
        hint && <div className="note">{hint}</div>
      )}
    </div>
  )
}

/** Downscales a picked photo so it fits comfortably in localStorage. */
function readPhoto(file: File, max = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that photo'))
    }
    img.src = url
  })
}

export function PhotoButton({
  photo,
  onPhoto,
  label,
  tall,
}: {
  photo?: string
  onPhoto: (dataUrl: string) => void
  label: string
  tall?: boolean
}) {
  return (
    <label className={`photo-btn${tall ? ' tall' : ''}${photo ? ' has-photo' : ''}`}>
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) onPhoto(await readPhoto(file))
        }}
      />
      {photo ? (
        <>
          <img src={photo} alt="" />
          <span className="photo-change">
            <Icon name="camera" size={16} />
            Change photo
          </span>
        </>
      ) : (
        <>
          <Icon name="camera" size={tall ? 30 : 20} sw={tall ? 1.6 : 1.8} />
          {label}
        </>
      )}
    </label>
  )
}
