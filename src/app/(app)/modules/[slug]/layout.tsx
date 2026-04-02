'use client'

export default function ModuleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        maxWidth: '60%',
        margin: '0 auto',
        padding: '2rem 2rem 5rem',
      }}
    >
      {children}
    </div>
  )
}
