"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabaseClient"

// Dashboard específico para estudiantes
export default function StudentDashboard({ user }) {
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

  const renderContent = () => {
    switch (activeSection) {
      case "historia":
        return (
          <div className="section-content">
            <h3>📚 Historia Académica</h3>
            <div className="academic-history">
              <div className="history-card">
                <h4>Materias Cursadas</h4>
                <p>Aquí se mostrarán las materias que has cursado</p>
                <div className="placeholder-content">
                  <div className="subject-item">
                    <span>Matemática I</span>
                    <span className="grade">8.5</span>
                  </div>
                  <div className="subject-item">
                    <span>Programación I</span>
                    <span className="grade">9.0</span>
                  </div>
                  <div className="subject-item">
                    <span>Física I</span>
                    <span className="grade">7.5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case "estadisticas":
        return (
          <div className="section-content">
            <h3>📊 Estadísticas</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Promedio General</h4>
                <div className="stat-value">8.3</div>
              </div>
              <div className="stat-card">
                <h4>Materias Aprobadas</h4>
                <div className="stat-value">12</div>
              </div>
              <div className="stat-card">
                <h4>Materias Pendientes</h4>
                <div className="stat-value">3</div>
              </div>
              <div className="stat-card">
                <h4>Progreso de Carrera</h4>
                <div className="stat-value">65%</div>
              </div>
            </div>
          </div>
        )

      case "experiencias":
        return (
          <div className="section-content">
            <h3>🎓 Experiencias</h3>
            <div className="experiences-list">
              <div className="experience-card">
                <h4>Proyecto Final - Sistema Web</h4>
                <p>Desarrollo de aplicación web con React y Spring Boot</p>
                <span className="experience-date">2024</span>
              </div>
              <div className="experience-card">
                <h4>Práctica Profesional</h4>
                <p>Desarrollo en empresa de software local</p>
                <span className="experience-date">2023</span>
              </div>
            </div>
          </div>
        )

      case "inscripciones":
        return (
          <div className="section-content">
            <h3>📝 Inscripciones</h3>
            <div className="inscriptions-section">
              <div className="current-inscriptions">
                <h4>Inscripciones Actuales</h4>
                <div className="inscription-item">
                  <span>Programación II</span>
                  <span className="status confirmed">Confirmada</span>
                </div>
                <div className="inscription-item">
                  <span>Base de Datos</span>
                  <span className="status pending">Pendiente</span>
                </div>
              </div>
              <button className="action-button">Nueva Inscripción</button>
            </div>
          </div>
        )

      default:
        return <div>Selecciona una sección</div>
    }
  }

  if (loading) {
    return <div className="loading">Cargando datos del estudiante...</div>
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar de navegación */}
      <div className="dashboard-sidebar">
        <div className="student-profile">
          <div className="profile-avatar">👨‍🎓</div>
          <h3>{studentData?.nombre || "Estudiante"}</h3>
          <p>{user.email}</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-item ${activeSection === "historia" ? "active" : ""}`}
            onClick={() => setActiveSection("historia")}
          >
            📚 Historia Académica
          </button>
          <button
            className={`sidebar-item ${activeSection === "estadisticas" ? "active" : ""}`}
            onClick={() => setActiveSection("estadisticas")}
          >
            📊 Estadísticas
          </button>
          <button
            className={`sidebar-item ${activeSection === "experiencias" ? "active" : ""}`}
            onClick={() => setActiveSection("experiencias")}
          >
            🎓 Experiencias
          </button>
          <button
            className={`sidebar-item ${activeSection === "inscripciones" ? "active" : ""}`}
            onClick={() => setActiveSection("inscripciones")}
          >
            📝 Inscripciones
          </button>
        </nav>
      </div>

      {/* Contenido principal */}
      <div className="dashboard-main">{renderContent()}</div>
    </div>
  )
}
