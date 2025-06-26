"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/supabaseClient"

// Dashboard específico para estudiantes
export default function StudentDashboard({ user: User }) {
  const [activeSection, setActiveSection] = useState("historia")
  const [studentData, setStudentData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Cargar datos del estudiante desde Supabase
    const loadStudentData = async () => {
      try {
        const { data, error } = await supabase.from("persona").select("*").eq("mail", user.email).single()

        if (error) {
          console.error("Error cargando datos del estudiante:", error)
        } else {
          setStudentData(data)
        }
      } catch (err) {
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }

    loadStudentData()
  }, [user.email])

}
