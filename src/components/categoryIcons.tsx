import type { Category } from '../types/academic'

const iconProps = {
  width: 36,
  height: 36,
  viewBox: '0 0 36 36',
  fill: 'none',
  'aria-hidden': true,
}

const softShape = (
  <>
    <path
      d="M18 3.5c8.4 0 14.5 5.7 14.5 13.7 0 8.7-6.4 15.3-14.9 15.3C9.4 32.5 3.5 26.4 3.5 18S9.6 3.5 18 3.5Z"
      fill="currentColor"
      opacity="0.14"
    />
    <path
      d="M9.5 9.1c2.5-2.2 5.6-3.3 9.2-3.1"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.6"
      opacity="0.28"
    />
  </>
)

const SwapIcon = () => (
  <svg {...iconProps}>
    {softShape}
    <path d="M12.5 12.5h11.2" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
    <path d="m15.4 9.6-3.4 3 3.4 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
    <path d="M23.5 23.5H12.3" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
    <path d="m20.6 20.5 3.4 3-3.4 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
  </svg>
)

const CalendarIcon = () => (
  <svg {...iconProps}>
    {softShape}
    <rect x="9.5" y="10.5" width="17" height="16" rx="4" fill="#fff" stroke="currentColor" strokeWidth="1.8" />
    <path d="M9.5 15.5h17M14 8.8v4M22 8.8v4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    <path d="M14.5 19h2.5M19.5 19H22M14.5 23h2.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" opacity="0.7" />
  </svg>
)

const BagIcon = () => (
  <svg {...iconProps}>
    {softShape}
    <path d="M10 15.2h16v9.1a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3v-9.1Z" fill="#fff" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    <path d="M14.5 15v-2a3.5 3.5 0 0 1 7 0v2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    <path d="M18 18.5v4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" opacity="0.7" />
  </svg>
)

const CapIcon = () => (
  <svg {...iconProps}>
    {softShape}
    <path d="M18 9.5 7.8 14.4 18 19.4l10.2-5L18 9.5Z" fill="#fff" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    <path d="M11.5 17v4.4c0 2 3 3.7 6.5 3.7s6.5-1.7 6.5-3.7V17" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    <path d="M27.6 15.2v6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" opacity="0.7" />
  </svg>
)

const MedalIcon = () => (
  <svg {...iconProps}>
    {softShape}
    <path d="m12.2 8.8 3 7M23.8 8.8l-3 7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    <circle cx="18" cy="21" r="6.5" fill="#fff" stroke="currentColor" strokeWidth="1.8" />
    <path d="m18 18.2 1 2 2.1.3-1.5 1.5.4 2.1-2-1.1-2 1.1.4-2.1-1.5-1.5 2.1-.3 1-2Z" fill="currentColor" opacity="0.65" />
  </svg>
)

const DocIcon = () => (
  <svg {...iconProps}>
    {softShape}
    <path d="M12 7.5h9l4 4v15a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2v-17a2 2 0 0 1 2-2Z" fill="#fff" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    <path d="M21 8v4h4" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    <path d="M14 17h8M14 21h8M14 25h5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" opacity="0.7" />
  </svg>
)

const RULES: { test: (label: string) => boolean; Icon: () => React.JSX.Element }[] = [
  { test: (label) => label.includes('전과') || label.includes('전부'), Icon: SwapIcon },
  { test: (label) => label.includes('수강'), Icon: CalendarIcon },
  { test: (label) => label.includes('휴학'), Icon: BagIcon },
  { test: (label) => label.includes('복학'), Icon: CapIcon },
  { test: (label) => label.includes('장학'), Icon: MedalIcon },
  { test: (label) => label.includes('졸업'), Icon: DocIcon },
]

export function CategoryIcon({ category }: { category: Category }) {
  const label = category.label ?? ''
  const rule = RULES.find((item) => item.test(label))
  const Icon = rule?.Icon ?? DocIcon
  return <Icon />
}
