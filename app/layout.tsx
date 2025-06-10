import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Asistente-Virtual',
  description: 'Asistente Virtual como soporte academico para una carrera de la UNSL',
  generator: 'Juan Manuel Sanchez.',
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
