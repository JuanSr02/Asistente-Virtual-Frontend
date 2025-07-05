"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/supabaseClient";
import Auth from "@/app/auth/page";
import Dashboard from "@/app/dashboard/page";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/toaster"; // Importa el Toaster

const publicRoutes = ["/reset-password", "/auth"];

// Componente separado para el loading
const LoadingScreen = () => (
  <html lang="es">
    <body>
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    </body>
  </html>
);

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

  // Función para inicializar autenticación
  const initializeAuth = useCallback(async () => {
    try {
      console.log("Inicializando autenticación...");

      // Agregar un pequeño delay para evitar problemas de timing
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

  // Efecto para inicializar autenticación
  useEffect(() => {
    let isMounted = true;

    if (!isInitialized) {
      initializeAuth();
    }

    // Listener para cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;

        console.log(
          "Auth state changed:",
          event,
          newSession?.user?.email || "No session"
        );
        setSession(newSession);

        // Si se está inicializando y hay un cambio de auth, marcar como inicializado
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

  // Efecto para manejo de redirecciones
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

  // Mostrar loading mientras se inicializa
  if (!isInitialized || loading) {
    return <LoadingScreen />;
  }

  const isPublicRoute = publicRoutes.includes(pathname || "");

  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <main className="flex-1">
          {!isPublicRoute && !session ? (
            <Auth />
          ) : session && !isPublicRoute ? (
            <Dashboard user={session.user} />
          ) : (
            children
          )}
        </main>

        {/* Añade el Toaster aquí, preferiblemente cerca del final del body */}
        <Toaster />

        <footer className="bg-gray-100 text-center text-sm text-black py-4 border-t border-gray-200">
          Universidad Nacional de San Luis · Departamento de Informática · 2025
          © Juan Sánchez (juanma2002123@gmail.com)
        </footer>
      </body>
    </html>
  );
}
