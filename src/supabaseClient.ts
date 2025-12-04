import { createBrowserClient } from "@supabase/ssr";

// Asegúrate de que estas variables estén definidas en tu .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Faltan las variables de entorno de Supabase");
}

// Usamos createBrowserClient para que la sesión se guarde en Cookies
// y sea accesible por el Middleware y los Server Components.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
