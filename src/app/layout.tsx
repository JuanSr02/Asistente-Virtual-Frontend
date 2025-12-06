"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/supabaseClient";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import QueryProvider from "@/providers/query-provider";
import Link from "next/link";
import { ConfirmDialogProvider } from "@/components/providers/confirm-dialog-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    // El listener de auth state change es útil para limpiar caché de React Query si cambia el usuario
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      // Opcional: queryClient.clear() aquí si fuera necesario
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [initializeAuth]);

  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <title>Asistente Virtual</title>
        <link rel="manifest" href="/manifest.json" />
      </head>

      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <ConfirmDialogProvider>
              {/* Si no está inicializado, mostramos spinner para evitar flash */}
              {!isInitialized ? (
                <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
                  <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  <main className="flex-1">{children}</main>

                  <Toaster />

                  <footer className="bg-muted text-muted-foreground border-t border-border py-4 px-4 sm:px-6 lg:px-8">
                    <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-2">
                      <span className="text-sm">
                        Asistente Virtual - UNSL · Dept. de Informática · ©
                        2025
                      </span>
                      <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm">
                        <Link
                          href="/terminos-condiciones"
                          className="hover:text-primary hover:underline"
                        >
                          Términos y Condiciones
                        </Link>
                        <span className="hidden sm:inline text-muted-foreground/50">
                          |
                        </span>
                        <Link
                          href="/politica-privacidad"
                          className="hover:text-primary hover:underline"
                        >
                          Política de Privacidad
                        </Link>
                      </div>
                      <span className="text-xs text-muted-foreground/80">
                        Desarrollado por Juan Sánchez
                      </span>
                    </div>
                  </footer>
                </>
              )}
              <div id="modal-root"></div>
            </ConfirmDialogProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
