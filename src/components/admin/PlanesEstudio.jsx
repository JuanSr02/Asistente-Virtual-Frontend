"use client"

import { useState, useEffect, useRef } from "react"
import planesEstudioService from "../../services/planesEstudioService"
import { APP_CONFIG } from "../../config"

export default function PlanesEstudio() {
  const [planes, setPlanes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(null)
  const fileInputRef = useRef(null)

  // Cargar planes al montar el componente
  useEffect(() => {
    cargarPlanes()
  }, [])

  // Función para cargar los planes de estudio
  const cargarPlanes = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await planesEstudioService.obtenerPlanes()
      setPlanes(data)
    } catch (err) {
      console.error("Error al cargar planes:", err)
      setError("No se pudieron cargar los planes de estudio. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  // Función para manejar la selección de un plan
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan.codigo === selectedPlan?.codigo ? null : plan)
  }

  // Función para manejar la carga de un archivo
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validar tipo de archivo
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
    if (!APP_CONFIG.ALLOWED_FILE_EXTENSIONS.includes(fileExtension)) {
      setError(`Tipo de archivo no permitido. Use: ${APP_CONFIG.ALLOWED_FILE_EXTENSIONS.join(", ")}`)
      fileInputRef.current.value = "" // Limpiar input
      return
    }

    setUploading(true)
    setError(null)
    setUploadSuccess(null)

    try {
      const resultado = await planesEstudioService.cargarPlan(file)
      setUploadSuccess(
        `Plan de estudio cargado exitosamente: ${resultado.propuesta} (${resultado.cantidadMateriasCargadas} materias)`,
      )
      // Recargar la lista de planes
      cargarPlanes()
    } catch (err) {
      console.error("Error al cargar archivo:", err)
      setError("Error al cargar el plan de estudio. Verifique el formato del archivo.")
    } finally {
      setUploading(false)
      fileInputRef.current.value = "" // Limpiar input
    }
  }

  // Función para eliminar un plan
  const handleDeletePlan = async () => {
    if (!selectedPlan) return

    if (!window.confirm(`¿Está seguro que desea eliminar el plan ${selectedPlan.propuesta}?`)) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      await planesEstudioService.eliminarPlan(selectedPlan.codigo)
      setSelectedPlan(null)
      // Recargar la lista de planes
      cargarPlanes()
      setUploadSuccess("Plan de estudio eliminado correctamente")
    } catch (err) {
      console.error("Error al eliminar plan:", err)
      setError("No se pudo eliminar el plan de estudio. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="planes-estudio-container">
      <h2 className="section-title">Planes de Estudio</h2>

      {/* Sección de acciones */}
      <div className="planes-actions">
        <div className="upload-section">
          <input
            type="file"
            id="file-upload"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xls,.xlsx"
            className="file-input"
            disabled={uploading}
          />
          <label htmlFor="file-upload" className={`file-label ${uploading ? "disabled" : ""}`}>
            {uploading ? "Cargando..." : "Cargar Plan de Estudio"}
          </label>
          <p className="file-help">Formatos permitidos: XLS, XLSX</p>
        </div>

        <button
          className={`delete-button ${!selectedPlan ? "disabled" : ""}`}
          onClick={handleDeletePlan}
          disabled={!selectedPlan || loading}
        >
          Eliminar Plan Seleccionado
        </button>
      </div>

      {/* Mensajes de estado */}
      {error && <div className="error-message">{error}</div>}
      {uploadSuccess && <div className="success-message">{uploadSuccess}</div>}

      {/* Tabla de planes */}
      <div className="planes-table-container">
        {loading ? (
          <div className="loading-indicator">Cargando planes de estudio...</div>
        ) : planes.length === 0 ? (
          <div className="empty-state">
            <p>No hay planes de estudio cargados</p>
            <p className="empty-help">Cargue un archivo Excel para comenzar</p>
          </div>
        ) : (
          <table className="planes-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Propuesta</th>
                <th>Cantidad de Materias</th>
              </tr>
            </thead>
            <tbody>
              {planes.map((plan) => (
                <tr
                  key={plan.codigo}
                  className={selectedPlan?.codigo === plan.codigo ? "selected" : ""}
                  onClick={() => handleSelectPlan(plan)}
                >
                  <td>{plan.codigo}</td>
                  <td>{plan.propuesta}</td>
                  <td>{plan.cantidadMateriasCargadas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
