import { createClient } from "@supabase/supabase-js";

// recordar configurar las variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL! || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true }
});