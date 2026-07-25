export function ChatIcon({ size = 29 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="none" aria-hidden="true">
      <path
        d="M9.5 5.5h13A4.5 4.5 0 0 1 27 10v8a4.5 4.5 0 0 1-4.5 4.5h-7.2l-5.1 4.2c-.8.7-2 .1-1.9-1l.5-3.4A4.5 4.5 0 0 1 5 18V10a4.5 4.5 0 0 1 4.5-4.5Z"
        fill="currentColor"
      />
      <circle cx="11.6" cy="14" r="1.5" fill="#fff" />
      <circle cx="16" cy="14" r="1.5" fill="#fff" />
      <circle cx="20.4" cy="14" r="1.5" fill="#fff" />
    </svg>
  )
}
