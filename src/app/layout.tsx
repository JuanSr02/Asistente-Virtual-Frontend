import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ClientLayout } from "@/components/layout/client-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Asistente Virtual",
  description: "Soporte académico virtual para estudiantes de la UNSL.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground antialiased`}
      >
        {/* Delegamos la lógica de cliente al wrapper */}
        <ClientLayout>{children}</ClientLayout>
        <Analytics />
      </body>
    </html>
  );
}
