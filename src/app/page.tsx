// src/app/page.tsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/src/supabaseClient"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data?.session) {
        router.replace("/dashboard")
      } else {
        router.replace("/auth")
      }
    }

    checkSession()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen text-muted-foreground">
      Redirigiendo...
    </div>
  )
}
