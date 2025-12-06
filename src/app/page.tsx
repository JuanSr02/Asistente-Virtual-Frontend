import { redirect } from "next/navigation";

export default function Home() {
  // Redirigir a dashboard.
  // El Middleware se encargará de interceptar y mandar a /auth si no hay sesión.
  redirect("/dashboard");
}
