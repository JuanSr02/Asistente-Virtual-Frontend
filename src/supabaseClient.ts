import { createClient } from "@supabase/supabase-js"

// Variables de entorno: se configuran en `.env.local` y NUNCA se suben al repo
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente Supabase global
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
