export default function SectionLoading() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '40vh',
      color: 'var(--dimmer)',
      fontSize: '14px',
    }}>
      <div style={{
        width: '24px',
        height: '24px',
        border: '2px solid var(--border2)',
        borderTopColor: 'var(--orange)',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
      }} />
    </div>
  )
}
