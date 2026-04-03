import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import './globals.css'

export const metadata: Metadata = {
  title: "FSCreative\u2122 \u2014 The Brand Launch Playbook\u2122",
  icons: {
    icon: '/logo.png',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const theme = (cookieStore.get('blp-theme')?.value as 'dark' | 'light') ?? 'dark'

  return (
    <html lang="en" data-theme={theme} suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
