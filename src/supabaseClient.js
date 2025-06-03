import { createClient } from "@supabase/supabase-js"

// Estas son las credenciales de tu proyecto Supabase
// Las obtienes desde tu dashboard de Supabase en Settings > API
const supabaseUrl = "YOUR_SUPABASE_URL" // Reemplaza con tu URL
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY" // Reemplaza con tu clave anónima

// createClient crea la conexión con Supabase
// Este cliente nos permite hacer operaciones de auth, base de datos, etc.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
