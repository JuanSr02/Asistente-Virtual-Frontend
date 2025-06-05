import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Asistente Virtual',
  description: 'Asistente para ayudar a los estudiantes',
  generator: 'Juan Sanchez',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
