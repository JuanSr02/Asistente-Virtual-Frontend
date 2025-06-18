import { redirect } from "next/navigation"

export default function Home() {
  redirect('/auth') // o '/auth' según tu flujo preferido
}