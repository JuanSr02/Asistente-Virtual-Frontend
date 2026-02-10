"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/supabaseClient";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import QueryProvider from "@/providers/query-provider";
import { ConfirmDialogProvider } from "@/components/providers/confirm-dialog-provider";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeAuth = useCallback(async () => {
    try {
      await supabase.auth.getSession();
    } catch (error) {
      console.error("Error inicializando auth:", error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      // Opcional: limpiar caché si es necesario
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [initializeAuth]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <ConfirmDialogProvider>
          {!isInitialized ? (
            <div
              className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background"
              role="status"
              aria-live="polite"
              aria-label="Cargando aplicación"
            >
              <Loader2 className="w-10 h-10 text-primary animate-spin" aria-hidden="true" />
              <span className="sr-only">Cargando...</span>
            </div>
          ) : (
            <>
              {/* Skip link for keyboard navigation */}
              <a
                href="/dashboard"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                Saltar al contenido principal
              </a>

              <main id="main-content" className="flex-1 flex flex-col" role="main">
                {children}
              </main>

              <Toaster position="top-right" richColors aria-live="polite" />

              <footer
                className="bg-muted text-muted-foreground border-t border-border py-4 px-4 sm:px-6 lg:px-8 mt-auto"
                role="contentinfo"
              >
                <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-2">
                  <span className="text-sm">
                    Asistente Virtual - UNSL · Dept. de Informática · © 2025
                  </span>
                  <nav
                    className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm"
                    aria-label="Enlaces legales"
                  >
                    <Link
                      href="/terminos-condiciones"
                      className="hover:text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:rounded"
                    >
                      Términos y Condiciones
                    </Link>
                    <span className="hidden sm:inline text-muted-foreground/50" aria-hidden="true">
                      |
                    </span>
                    <Link
                      href="/politica-privacidad"
                      className="hover:text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:rounded"
                    >
                      Política de Privacidad
                    </Link>
                  </nav>
                  <span className="text-xs text-muted-foreground/80">
                    Desarrollado por Juan Sánchez 💻
                  </span>
                </div>
              </footer>
            </>
          )}
          <div id="modal-root" aria-live="polite"></div>
        </ConfirmDialogProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
