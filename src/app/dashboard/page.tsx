import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";

export default async function Dashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: persona } = await supabase
    .from("persona")
    .select("rol_usuario")
    .eq("supabase_user_id", user.id)
    .single();

  // Lógica de fallback similar a tu hook, pero en servidor
  let role = persona?.rol_usuario || "ESTUDIANTE";
  
  // Si no se encontró por ID, intentamos por email (migración)
  if (!persona && user.email) {
      const { data: personaByEmail } = await supabase
        .from("persona")
        .select("rol_usuario")
        .eq("mail", user.email)
        .single();
      if (personaByEmail) {
          role = personaByEmail.rol_usuario;
      }
  }

  // 3. Renderizamos el cliente con los datos ya listos (Zero CLS, Zero Loading Spinners iniciales)
  return <DashboardClient user={user} initialRole={role} />;
}