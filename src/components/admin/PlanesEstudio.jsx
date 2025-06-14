"use client"

import { useState, useEffect, useRef } from "react"
import planesEstudioService from "../../services/planesEstudioService"
import { APP_CONFIG } from "../../config"
import { TableSkeleton } from "../ui/Skeleton"
import MateriasModal from "./MateriasModal"
import { useSessionPersistence } from "../../hooks/useSessionPersistence"

export default function PlanesEstudio() {
  const { planesState, setPlanesState } = useSessionPersistence()

  const [planes, setPlanes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(planesState.selectedPlan)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(null)
  const [showMateriasModal, setShowMateriasModal] = useState(false)
  const fileInputRef = useRef(null)

  // Sincronizar el estado local con el persistente
  useEffect(() => {
    setSelectedPlan(planesState.selectedPlan)
  }, [planesState.selectedPlan])

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

      // Verificar si el plan seleccionado guardado aún existe
      if (planesState.selectedPlan && !data.some((plan) => plan.codigo === planesState.selectedPlan.codigo)) {
        setSelectedPlan(null)
        setPlanesState("selectedPlan", null)
      }
    } catch (err) {
      console.error("Error al cargar planes:", err)
      setError("No se pudieron cargar los planes de estudio. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  // Función para manejar la selección de un plan
  const handleSelectPlan = (plan) => {
    const newSelectedPlan = plan.codigo === selectedPlan?.codigo ? null : plan
    setSelectedPlan(newSelectedPlan)
    setPlanesState("selectedPlan", newSelectedPlan)
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
      // Actualizar timestamp de última actualización
      setPlanesState("lastUpdate", new Date().toISOString())
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
      setPlanesState("selectedPlan", null)
      // Recargar la lista de planes
      cargarPlanes()
      setUploadSuccess("Plan de estudio eliminado correctamente")
      // Actualizar timestamp de última actualización
      setPlanesState("lastUpdate", new Date().toISOString())
    } catch (err) {
      console.error("Error al eliminar plan:", err)
      setError("No se pudo eliminar el plan de estudio. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  // Función para mostrar materias del plan
  const handleVerMaterias = () => {
    if (selectedPlan) {
      setShowMateriasModal(true)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 pb-3 border-b border-gray-200">Planes de Estudio</h2>
        {planesState.lastUpdate && (
          <div className="text-sm text-gray-500">
            Última actualización: {new Date(planesState.lastUpdate).toLocaleString()}
          </div>
        )}
      </div>

      {/* Sección de acciones */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div className="flex flex-col">
          <input
            type="file"
            id="file-upload"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xls,.xlsx"
            className="absolute w-0 h-0 opacity-0 overflow-hidden -z-10"
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className={`inline-block px-6 py-3 rounded-lg font-semibold transition-all cursor-pointer ${
              uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 transform hover:-translate-y-0.5"
            } text-white`}
          >
            {uploading ? "Cargando..." : "Cargar Plan de Estudio"}
          </label>
          <p className="text-xs text-gray-500 mt-2">Formatos permitidos: XLS, XLSX</p>
        </div>

        <div className="flex gap-4">
          <button
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              !selectedPlan
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white transform hover:-translate-y-0.5"
            }`}
            onClick={handleVerMaterias}
            disabled={!selectedPlan}
          >
            📚 Ver Materias
          </button>
          <button
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              !selectedPlan || loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 text-white transform hover:-translate-y-0.5"
            }`}
            onClick={handleDeletePlan}
            disabled={!selectedPlan || loading}
          >
            🗑️ Eliminar Plan
          </button>
        </div>
      </div>

      {/* Mensajes de estado */}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}
      {uploadSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
          {uploadSuccess}
        </div>
      )}

      {/* Información del plan seleccionado */}
      {selectedPlan && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl mb-6 shadow-lg">
          <h4 className="text-lg font-semibold mb-4">Plan Seleccionado</h4>
          <div className="flex flex-wrap gap-6">
            <span className="text-sm opacity-90">
              <strong className="opacity-100">Código:</strong> {selectedPlan.codigo}
            </span>
            <span className="text-sm opacity-90">
              <strong className="opacity-100">Propuesta:</strong> {selectedPlan.propuesta}
            </span>
            <span className="text-sm opacity-90">
              <strong className="opacity-100">Materias:</strong> {selectedPlan.cantidadMateriasCargadas}
            </span>
          </div>
        </div>
      )}

      {/* Tabla de planes - Modificado para eliminar la barra de desplazamiento horizontal */}
      <div className="w-full overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} columns={3} />
        ) : planes.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-6xl mb-4 opacity-50">📋</div>
            <h4 className="text-xl text-gray-600 mb-2 font-semibold">No hay planes de estudio cargados</h4>
            <p className="text-sm text-gray-400">Cargue un archivo Excel para comenzar</p>
          </div>
        ) : (
          <div className="w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-4 text-left border-b border-gray-200 bg-gray-50 font-semibold text-gray-600">
                    Código
                  </th>
                  <th className="px-4 py-4 text-left border-b border-gray-200 bg-gray-50 font-semibold text-gray-600">
                    Propuesta
                  </th>
                  <th className="px-4 py-4 text-left border-b border-gray-200 bg-gray-50 font-semibold text-gray-600">
                    Cantidad de Materias
                  </th>
                </tr>
              </thead>
              <tbody>
                {planes.map((plan) => (
                  <tr
                    key={plan.codigo}
                    className={`cursor-pointer transition-all duration-200 border-l-4 ${
                      selectedPlan?.codigo === plan.codigo
                        ? "bg-blue-50 border-l-blue-500 shadow-sm"
                        : "border-l-transparent hover:bg-gray-50 hover:border-l-gray-300 hover:transform hover:translate-x-0.5"
                    }`}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    <td className="px-4 py-4 border-b border-gray-200">{plan.codigo}</td>
                    <td className="px-4 py-4 border-b border-gray-200">{plan.propuesta}</td>
                    <td className="px-4 py-4 border-b border-gray-200">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          selectedPlan?.codigo === plan.codigo ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {plan.cantidadMateriasCargadas}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de materias */}
      <MateriasModal isOpen={showMateriasModal} onClose={() => setShowMateriasModal(false)} plan={selectedPlan} />
    </div>
  )
}
