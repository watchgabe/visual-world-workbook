'use client'

export default function ModuleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="max-w-[100%] sm:max-w-[60%] mx-auto px-4 sm:px-8 pt-6 sm:pt-8 pb-20"
    >
      {children}
    </div>
  )
}
