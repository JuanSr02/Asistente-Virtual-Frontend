import { createClient } from "@supabase/supabase-js"

// Estas son las credenciales de tu proyecto Supabase
// Las obtienes desde tu dashboard de Supabase en Settings > API
const supabaseUrl = "https://qlbpcnyjsvhxnncjorku.supabase.co" // Reemplaza con tu URL
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsYnBjbnlqc3ZoeG5uY2pvcmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNDgzOTksImV4cCI6MjA1OTgyNDM5OX0.SCxpBnw4DLAwbptE4DoScq6rFN6QGeVtYDCZHthzWN4" // Reemplaza con tu clave anónima

// createClient crea la conexión con Supabase
// Este cliente nos permite hacer operaciones de auth, base de datos, etc.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
