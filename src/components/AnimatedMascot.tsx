import { useEffect, useRef, useState } from 'react'
import munmuniMascot from '../assets/munmuni-mascot.png'
import styles from '../App.module.css'

export function AnimatedMascot({ animationEnabled }: { animationEnabled: boolean }) {
  const mascotRef = useRef<HTMLSpanElement>(null)
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!animationEnabled) {
      setEyeOffset({ x: 0, y: 0 })
      return
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rect = mascotRef.current?.getBoundingClientRect()
      if (!rect) return

      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height * 0.62
      const x = (event.clientX - centerX) / (rect.width / 2)
      const y = (event.clientY - centerY) / (rect.height / 2)

      setEyeOffset({
        x: Math.max(-1, Math.min(1, x)) * 4,
        y: Math.max(-1, Math.min(1, y)) * 2.5,
      })
    }

    const resetEyes = () => setEyeOffset({ x: 0, y: 0 })

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerleave', resetEyes)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerleave', resetEyes)
    }
  }, [animationEnabled])

  const eyeTransform = `translate(${eyeOffset.x.toFixed(1)} ${eyeOffset.y.toFixed(1)})`

  return (
    <span ref={mascotRef} className={styles.heroMascot} role="img" aria-label="문무니 마스코트">
      <img className={styles.heroMascotImage} src={munmuniMascot} alt="" aria-hidden="true" />
      <svg className={styles.heroMascotOverlay} viewBox="0 0 1024 1024" aria-hidden="true">
        <g className={styles.mascotTrackingEyes}>
          <ellipse className={styles.mascotEyeCoverLeft} cx="408" cy="640" rx="31" ry="29" />
          <ellipse className={styles.mascotEyeCoverRight} cx="603" cy="640" rx="31" ry="29" />
          <g className={styles.mascotPupilLeft} transform={eyeTransform}>
            <circle className={styles.mascotPupilDot} cx="408" cy="640" r="22" />
            <circle className={styles.mascotPupilShine} cx="416" cy="630" r="5" />
          </g>
          <g className={styles.mascotPupilRight} transform={eyeTransform}>
            <circle className={styles.mascotPupilDot} cx="603" cy="640" r="22" />
            <circle className={styles.mascotPupilShine} cx="611" cy="630" r="5" />
          </g>
        </g>
        <g className={styles.mascotEarWiggleLeft}>
          <path d="M168 610c-54 10-100 43-113 76 35 20 92 10 147-30Z" />
        </g>
        <g className={styles.mascotEarWiggleRight}>
          <path d="M856 610c54 10 100 43 113 76-35 20-92 10-147-30Z" />
        </g>
      </svg>
    </span>
  )
}
