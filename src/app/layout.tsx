"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/supabaseClient";
import Auth from "@/app/auth/page";
import Dashboard from "@/app/dashboard/page";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Link from "next/link";

const publicRoutes = [
  "/reset-password",
  "/auth",
  "/subida-mobile",
  "/terminos-condiciones",
  "/politica-privacidad",
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // --- TODA LA LÓGICA DE AUTENTICACIÓN PERMANECE INTACTA ---
  const initializeAuth = useCallback(async () => {
    try {
      console.log("Inicializando autenticación...");
      await new Promise((resolve) => setTimeout(resolve, 100));
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error al obtener sesión:", error);
        setSession(null);
      } else {
        console.log(
          "Sesión obtenida:",
          data.session?.user?.email || "No session"
        );
        setSession(data.session);
      }
    } catch (error) {
      console.error("Error en initializeAuth:", error);
      setSession(null);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (!isInitialized) {
      initializeAuth();
    }
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;
        console.log(
          "Auth state changed:",
          event,
          newSession?.user?.email || "No session"
        );
        setSession(newSession);
        if (!isInitialized) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    );
    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [initializeAuth, isInitialized]);

  useEffect(() => {
    if (!isInitialized || loading) return;
    const isPublicRoute = publicRoutes.includes(pathname || "");
    console.log("Checking redirects:", {
      session: !!session,
      pathname,
      isPublicRoute,
    });
    if (!session && !isPublicRoute) {
      console.log("Redirecting to auth...");
      router.replace("/auth");
    } else if (session && pathname === "/auth") {
      console.log("Redirecting to dashboard...");
      router.replace("/dashboard");
    }
  }, [session, pathname, loading, router, isInitialized]);

  const isPublicRoute = publicRoutes.includes(pathname || "");

  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <title>Asistente Virtual</title>
        {/* --- Configuración PWA --- */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Asistente Virtual" />
        <meta name="apple-mobile-web-app-title" content="Asistente Virtual" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-navbutton-color" content="#2563eb" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="msapplication-starturl" content="/dashboard" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        {/* Usamos el favicon existente para el icono de iOS */}
        <link rel="apple-touch-icon" href="/favicon.ico" />
        {/* --- Fin Configuración PWA --- */}
      </head>

      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* MOVIDO DENTRO DEL BODY Y THEMEPROVIDER:
             Al renderizar el loading aquí, se beneficia de las clases de tema (dark/light)
             y evitamos duplicar las etiquetas <html> y <body>.
          */}
          {!isInitialized || loading ? (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
              <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <main className="flex-1">
                {
                  /* El contenido principal crece para empujar el footer hacia abajo */
                  !isPublicRoute && !session ? (
                    <Auth />
                  ) : session && !isPublicRoute ? (
                    <Dashboard user={session.user} />
                  ) : (
                    children
                  )
                }
              </main>

              <Toaster />

              {/* --- FOOTER RESPONSIVE --- */}
              <footer
                className="
                  bg-muted text-muted-foreground border-t border-border
                  py-4 px-4 sm:px-6 lg:px-8
                "
              >
                <div
                  className="
                    container mx-auto flex flex-col sm:flex-row items-center justify-between
                    text-center sm:text-left gap-2
                  "
                >
                  <span className="text-sm">
                    Asistente Virtual - UNSL · Dept. de Informática · © 2025
                  </span>

                  <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm">
                    <Link
                      href="/terminos-condiciones"
                      className="hover:text-primary transition-colors hover:underline"
                    >
                      Términos y Condiciones
                    </Link>
                    <span className="hidden sm:inline text-muted-foreground/50">
                      |
                    </span>
                    <Link
                      href="/politica-privacidad"
                      className="hover:text-primary transition-colors hover:underline"
                    >
                      Política de Privacidad
                    </Link>
                  </div>

                  <span className="text-xs text-muted-foreground/80">
                    Desarrollado por Juan Sánchez (juanma2002123@gmail.com)
                  </span>
                </div>
              </footer>
            </>
          )}
          <div id="modal-root"></div>
        </ThemeProvider>
      </body>
    </html>
  );
}
