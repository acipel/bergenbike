import type { ReactNode, SVGProps } from 'react'

const SHIELD = 'M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z'
const PIN = 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z'

const ICONS = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16L20 20" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  locate: (
    <>
      <circle cx="12" cy="12" r="6" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </>
  ),
  shield: <path d={SHIELD} />,
  shieldCheck: (
    <>
      <path d={SHIELD} />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  shieldAlert: (
    <>
      <path d={SHIELD} />
      <path d="M12 8.5v4M12 15.5v.2" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  minus: <path d="M6 12h12" />,
  navigate: <path d="M4 11l16-7-7 16-2-7z" />,
  pin: (
    <>
      <path d={PIN} />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  pinCheck: (
    <>
      <path d={PIN} />
      <path d="M9.5 9.5l1.8 1.8 3.2-3.2" />
    </>
  ),
  bike: (
    <>
      <circle cx="6" cy="16" r="3.5" />
      <circle cx="18" cy="16" r="3.5" />
      <path d="M6 16L10 9L12 16Z M10 9H16L12 16 M16 9L18 16 M16 9L15 6.5H17.5 M8.8 7.5H11.5" />
    </>
  ),
  bell: (
    <>
      <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </>
  ),
  back: <path d="M15 5l-7 7 7 7" />,
  edit: <path d="M4 20h4L19 9l-4-4L4 16z" />,
  camera: (
    <>
      <path d="M4 8h3l2-2.5h6L17 8h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  scan: (
    <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M7 12h10" />
  ),
  signal: (
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8" />
    </>
  ),
  warn: (
    <>
      <path d="M12 4L21.5 20H2.5z" />
      <path d="M12 10v4.5M12 17.2v.3" />
    </>
  ),
  map: (
    <>
      <path d="M3 6.5l6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5z" />
      <path d="M9 4v13.5M15 6.5V20" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof ICONS

interface Props extends SVGProps<SVGSVGElement> {
  name: IconName
  size?: number
  sw?: number
}

export function Icon({ name, size = 24, sw = 1.8, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {ICONS[name]}
    </svg>
  )
}
