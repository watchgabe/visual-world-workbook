interface ProgressBarProps {
  percent?: number
  label?: string
}

export function ProgressBar({ percent = 0, label = 'Overall Progress' }: ProgressBarProps) {
  return (
    <div>
      <div
        style={{
          height: '3px',
          background: 'var(--border)',
          borderRadius: '2px',
          marginBottom: '4px',
        }}
      >
        <div
          style={{
            height: '100%',
            background: 'var(--orange)',
            borderRadius: '2px',
            width: `${percent}%`,
            transition: 'width .4s',
          }}
        />
      </div>
      <div
        style={{
          fontSize: '10px',
          color: 'var(--dimmer)',
          fontWeight: 500,
        }}
      >
        {label} {percent}%
      </div>
    </div>
  )
}
