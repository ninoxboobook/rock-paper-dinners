import { useMemo } from 'react'

const COLORS = ['#ff2e88', '#21e6c1', '#ffd60a', '#7b5cff', '#ff7b00']

/** Lightweight one-shot confetti burst (pure CSS, no deps). Remount to replay. */
export function Confetti({ count = 36 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.25,
        duration: 1.1 + Math.random() * 0.9,
        rotate: Math.random() * 360,
        color: COLORS[i % COLORS.length],
        size: 7 + Math.random() * 7,
      })),
    [count],
  )
  return (
    <div className="confetti" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            width: p.size,
            height: p.size * 0.4,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  )
}
