import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Asistente-Virtual',
  description: 'Asistente Virtual como soporte académico para una carrera de la UNSL',
  generator: 'Juan Manuel Sanchez',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
