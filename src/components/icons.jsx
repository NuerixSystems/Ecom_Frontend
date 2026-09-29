// Inline SVG icon set used by the Header and Hero.
// All icons inherit colour from `currentColor` and accept className / other svg props.

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
}

export function SearchIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </svg>
  )
}

export function UserIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.5 20.2c.9-3.7 3.8-5.7 7.5-5.7s6.6 2 7.5 5.7" />
    </svg>
  )
}

export function CartIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 4h2.3l2.1 10.3a1.6 1.6 0 0 0 1.6 1.3h8.1a1.6 1.6 0 0 0 1.6-1.2L20.4 8H6.2" />
      <circle cx="9.6" cy="19.4" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="17" cy="19.4" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function MenuIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function CloseIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function ArrowRightIcon(props) {
  return (
    <svg {...base} strokeWidth={2.2} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

// Karpaga Crackers logo mark: a radiating firework burst around a golden core.
export function LogoMark(props) {
  const rays = Array.from({ length: 12 }, (_, i) => i * 30)
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" {...props}>
      <g transform="translate(24 24)">
        {rays.map((deg, i) => (
          <path
            key={deg}
            d="M0 -22 C 3.4 -17.5 3.4 -13 0 -9.5 C -3.4 -13 -3.4 -17.5 0 -22 Z"
            fill={i % 2 === 0 ? '#E4362B' : '#FF8A1F'}
            transform={`rotate(${deg})`}
          />
        ))}
        <circle r="9" fill="#FFC300" />
        <circle r="9" fill="none" stroke="#E4362B" strokeWidth="1.4" />
        <path d="M0 -4.5 C 3 -1.5 3 2 0 4.8 C -3 2 -3 -1.5 0 -4.5 Z" fill="#E4362B" />
      </g>
    </svg>
  )
}

/* ---------- Additional icons ---------- */

export function StarIcon({ filled = true, ...props }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" {...props}>
      <path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1L3.2 9.6l6.1-.8L12 3.2z" />
    </svg>
  )
}

export function ShieldIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l7 3v5.2c0 4.7-3 8.2-7 9.8-4-1.6-7-5.1-7-9.8V6l7-3z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export function AwardIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="9" r="5.5" />
      <path d="M8.6 13.6 7.5 21l4.5-2.6 4.5 2.6-1.1-7.4" />
    </svg>
  )
}

export function BoxIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8z" />
      <path d="m3 8 9 5 9-5M12 13v8" />
    </svg>
  )
}

export function TruckIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 6.5h10.5v10H2.5zM13 10h4l3.5 3v3.5H13" />
      <circle cx="6.5" cy="17.8" r="1.8" />
      <circle cx="17" cy="17.8" r="1.8" />
    </svg>
  )
}

export function UsersIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 5.2a3 3 0 0 1 0 5.6M18 14.4c1.8.7 3 2.6 3 5.6" />
    </svg>
  )
}

export function HeartIcon({ filled = false, ...props }) {
  return (
    <svg {...base} fill={filled ? 'currentColor' : 'none'} {...props}>
      <path d="M12 20s-7.5-4.6-7.5-10.4A4.1 4.1 0 0 1 12 7.4a4.1 4.1 0 0 1 7.5 2.2C19.5 15.4 12 20 12 20z" />
    </svg>
  )
}

export function SparklesIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M11 3.5l1.8 5.2 5.2 1.8-5.2 1.8L11 17.5l-1.8-5.2L4 10.5l5.2-1.8L11 3.5z" />
      <path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z" />
    </svg>
  )
}

export function PhoneIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v3.5a2 2 0 0 1-2 2A15.5 15.5 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  )
}

export function WhatsAppIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 20.5l1.4-4.3A8.3 8.3 0 1 1 8 19.3l-4.5 1.2z" />
      <path d="M9 8.8c.3 2.3 2.9 5 5.6 5.7l1.4-1.3-1.9-1-.9.8c-.9-.4-1.9-1.4-2.3-2.3l.8-.9-1-1.9L9 8.8z" />
    </svg>
  )
}

export function MailIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  )
}

export function PinIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s7-6.2 7-11.2A7 7 0 1 0 5 9.8C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.8" r="2.4" />
    </svg>
  )
}

export function LockIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="11" width="14" height="9.5" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

export function CheckCircleIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.3 12.3 2.5 2.5 5-5.2" />
    </svg>
  )
}

export function AlertCircleIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5.4" />
      <circle cx="12" cy="16.2" r="0.15" fill="currentColor" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export function PlusIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function MinusIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14" />
    </svg>
  )
}

export function ChevronRightIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

export function ChevronLeftIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="m15 6-6 6 6 6" />
    </svg>
  )
}

export function FacebookIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M14.5 21v-7.5h2.6l.5-3h-3.1V8.7c0-.9.4-1.6 1.7-1.6h1.5V4.4c-.3 0-1.2-.2-2.3-.2-2.4 0-4 1.4-4 4.1v2.2H8.4v3h2.5V21" />
    </svg>
  )
}

export function InstagramIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r=".9" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function YoutubeIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="m10.2 9.2 4.6 2.8-4.6 2.8V9.2z" fill="currentColor" />
    </svg>
  )
}

export function XIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 4.5h3.7l11.3 15h-3.7l-11.3-15zM19 4.5l-6.2 6.9M5 19.5l6.3-7" />
    </svg>
  )
}

export function ArrowLeftIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </svg>
  )
}
