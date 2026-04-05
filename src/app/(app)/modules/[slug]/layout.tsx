'use client'

export default function ModuleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-full max-w-[700px] mx-auto px-4 sm:px-8 pt-6 sm:pt-8 pb-20"
    >
      {children}
    </div>
  )
}
