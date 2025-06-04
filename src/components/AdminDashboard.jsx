"use client"

import { useState, useEffect } from "react"
import { supabase } from "../supabaseClient"

// Dashboard específico para administradores
export default function AdminDashboard({ user }) {
  const [activeSection, setActiveSection] = useState("usuarios")
  const [adminData, setAdminData] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Cargar datos del administrador y usuarios
    const loadAdminData = async () => {
      try {
        // Cargar datos del admin
        const { data: adminInfo, error: adminError } = await supabase
          .from("persona")
          .select("*")
          .eq("mail", user.email)
          .single()

        if (adminError) {
          console.error("Error cargando datos del admin:", adminError)
        } else {
          setAdminData(adminInfo)
        }

        // Cargar lista de usuarios
        const { data: usersData, error: usersError } = await supabase.from("persona").select("*").order("nombre")

        if (usersError) {
          console.error("Error cargando usuarios:", usersError)
        } else {
          setUsers(usersData || [])
        }
      } catch (err) {
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }

    loadAdminData()
  }, [user.email])

  const renderContent = () => {
    switch (activeSection) {
      case "usuarios":
        return (
          <div className="section-content">
            <h3>👥 Gestión de Usuarios</h3>
            <div className="users-section">
              <div className="section-header">
                <button className="action-button">+ Nuevo Usuario</button>
                <input type="text" placeholder="Buscar usuarios..." className="search-input" />
              </div>

              <div className="users-table">
                <div className="table-header">
                  <span>Nombre</span>
                  <span>Email</span>
                  <span>Rol</span>
                  <span>Acciones</span>
                </div>
                {users.map((usuario, index) => (
                  <div key={index} className="table-row">
                    <span>{usuario.nombre || "Sin nombre"}</span>
                    <span>{usuario.mail}</span>
                    <span className={`role-badge role-badge-${usuario.role?.toLowerCase()}`}>{usuario.role}</span>
                    <div className="row-actions">
                      <button className="edit-button">✏️</button>
                      <button className="delete-button">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "plan":
        return (
          <div className="section-content">
            <h3>📋 Plan de Estudio</h3>
            <div className="study-plan-section">
              <div className="section-header">
                <button className="action-button">+ Nueva Materia</button>
                <select className="filter-select">
                  <option>Todas las carreras</option>
                  <option>Ingeniería en Sistemas</option>
                  <option>Licenciatura en Informática</option>
                </select>
              </div>

              <div className="subjects-grid">
                <div className="subject-card">
                  <h4>Programación I</h4>
                  <p>Primer año - Primer cuatrimestre</p>
                  <div className="subject-stats">
                    <span>👥 45 estudiantes</span>
                    <span>📊 Promedio: 7.8</span>
                  </div>
                </div>
                <div className="subject-card">
                  <h4>Matemática I</h4>
                  <p>Primer año - Primer cuatrimestre</p>
                  <div className="subject-stats">
                    <span>👥 42 estudiantes</span>
                    <span>📊 Promedio: 6.9</span>
                  </div>
                </div>
                <div className="subject-card">
                  <h4>Base de Datos</h4>
                  <p>Segundo año - Primer cuatrimestre</p>
                  <div className="subject-stats">
                    <span>👥 38 estudiantes</span>
                    <span>📊 Promedio: 8.2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case "estadisticas":
        return (
          <div className="section-content">
            <h3>📈 Estadísticas del Sistema</h3>
            <div className="admin-stats">
              <div className="stats-overview">
                <div className="stat-card large">
                  <h4>Total de Usuarios</h4>
                  <div className="stat-value">{users.length}</div>
                  <div className="stat-breakdown">
                    <span>👨‍🎓 {users.filter((u) => u.role === "ESTUDIANTE").length} Estudiantes</span>
                    <span>👨‍💼 {users.filter((u) => u.role === "ADMINISTRADOR").length} Administradores</span>
                  </div>
                </div>

                <div className="stat-card">
                  <h4>Inscripciones Activas</h4>
                  <div className="stat-value">156</div>
                </div>

                <div className="stat-card">
                  <h4>Materias Disponibles</h4>
                  <div className="stat-value">24</div>
                </div>

                <div className="stat-card">
                  <h4>Promedio General</h4>
                  <div className="stat-value">7.6</div>
                </div>
              </div>

              <div className="charts-section">
                <div className="chart-placeholder">
                  <h4>📊 Rendimiento por Materia</h4>
                  <p>Aquí iría un gráfico de rendimiento</p>
                </div>
                <div className="chart-placeholder">
                  <h4>📈 Inscripciones por Mes</h4>
                  <p>Aquí iría un gráfico de inscripciones</p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return <div>Selecciona una sección</div>
    }
  }

  if (loading) {
    return <div className="loading">Cargando panel de administración...</div>
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar de navegación */}
      <div className="dashboard-sidebar">
        <div className="admin-profile">
          <div className="profile-avatar">👨‍💼</div>
          <h3>{adminData?.nombre || "Administrador"}</h3>
          <p>{user.email}</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-item ${activeSection === "usuarios" ? "active" : ""}`}
            onClick={() => setActiveSection("usuarios")}
          >
            👥 Usuarios
          </button>
          <button
            className={`sidebar-item ${activeSection === "plan" ? "active" : ""}`}
            onClick={() => setActiveSection("plan")}
          >
            📋 Plan de Estudio
          </button>
          <button
            className={`sidebar-item ${activeSection === "estadisticas" ? "active" : ""}`}
            onClick={() => setActiveSection("estadisticas")}
          >
            📈 Estadísticas
          </button>
        </nav>
      </div>

      {/* Contenido principal */}
      <div className="dashboard-main">{renderContent()}</div>
    </div>
  )
}
