'use client'

const RADIUS = 18
const CIRCUMFERENCE = 2 * Math.PI * RADIUS // ~113.097

interface ProgressRingProps {
  percent: number // 0-100
  size?: number // default 44
  showLabel?: boolean // default true — show percentage text inside ring
}

export function ProgressRing({ percent = 0, size = 44, showLabel = true }: ProgressRingProps) {
  const clampedPercent = Math.max(0, Math.min(100, Math.round(percent)))
  const offset = CIRCUMFERENCE - (CIRCUMFERENCE * clampedPercent) / 100

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      role="img"
      aria-label={`${clampedPercent}% complete`}
    >
      {/* Track circle */}
      <circle
        cx="22"
        cy="22"
        r={RADIUS}
        fill="none"
        stroke="var(--border2)"
        strokeWidth="3"
      />
      {/* Fill circle — rotated -90deg so fill starts at 12 o'clock */}
      <circle
        cx="22"
        cy="22"
        r={RADIUS}
        fill="none"
        stroke={clampedPercent === 100 ? 'var(--green-text)' : 'var(--orange)'}
        strokeWidth="3"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: '22px 22px',
          transition: 'stroke-dashoffset .4s ease',
        }}
      />
      {/* Percentage label */}
      {showLabel && (
        <text
          x="22"
          y="26.5"
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fill="var(--text)"
        >
          {clampedPercent}%
        </text>
      )}
    </svg>
  )
}
