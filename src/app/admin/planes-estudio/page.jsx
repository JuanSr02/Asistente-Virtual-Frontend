"use client"

import { useState, useEffect, useRef } from "react"
import planesEstudioService from "@/services/planesEstudioService"
import { APP_CONFIG }  from "@/lib/config" 
import { TableSkeleton } from "@/components/Skeleton"
import MateriasModal from "@/components/modals/MateriasModal"
import { useSessionPersistence } from "@/hooks/useSessionPersistence"

// Tiempo en milisegundos para considerar los datos como "frescos" (5 minutos)
const DATA_FRESHNESS_THRESHOLD = 5 * 60 * 1000


export default function PlanesEstudio() {
  const { planesState, setPlanesState } = useSessionPersistence()

  const [planes, setPlanes] = useState(planesState.planes || [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(planesState.selectedPlan || null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(null)
  const [showMateriasModal, setShowMateriasModal] = useState(planesState.showMateriasModal || false)
  const fileInputRef = useRef(null)

  // Sincronizar el estado local con el persistente cuando cambia planesState
  useEffect(() => {
    if (planesState.planes) setPlanes(planesState.planes)
    setSelectedPlan(planesState.selectedPlan || null)
    setShowMateriasModal(planesState.showMateriasModal || false)
  }, [planesState])

    // Verificar si los datos están desactualizados
  const shouldRefreshData = () => {
    if (!planesState.lastFetch) return true
    const lastFetchTime = new Date(planesState.lastFetch).getTime()
    return (Date.now() - lastFetchTime) > DATA_FRESHNESS_THRESHOLD
  }

   // Cargar planes solo si es necesario
  useEffect(() => {
    const loadInitialData = async () => {
      if (planesState.planes.length === 0 || shouldRefreshData()) {
        await cargarPlanes()
      }
    }
    loadInitialData()
  }, [])

   const cargarPlanes = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await planesEstudioService.obtenerPlanes()
      setPlanes(data)
      // Guardar en el estado persistente
      setPlanesState("planes", data)
      setPlanesState("lastFetch", new Date().toISOString())

      // Validar si el plan seleccionado existe en la nueva lista
      if (planesState.selectedPlan && !data.some(plan => plan.codigo === planesState.selectedPlan.codigo)) {
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


  const handleSelectPlan = (plan) => {
    const newSelectedPlan = plan.codigo === selectedPlan?.codigo ? null : plan
    setSelectedPlan(newSelectedPlan)
    setPlanesState("selectedPlan", newSelectedPlan)
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()
    if (!APP_CONFIG.FILES.ALLOWED_EXTENSIONS.includes(fileExtension)) {
      setError(`Tipo de archivo no permitido. Use: ${APP_CONFIG.FILES.ALLOWED_EXTENSIONS.join(", ")}`)
      fileInputRef.current.value = "" 
      return
    }

    setUploading(true)
    setError(null)
    setUploadSuccess(null)

    try {
      const resultado = await planesEstudioService.cargarPlan(file)
      setUploadSuccess(`Plan de estudio cargado exitosamente: ${resultado.propuesta} (${resultado.cantidadMateriasCargadas} materias)`)
      await cargarPlanes()
      setPlanesState("lastUpdate", new Date().toISOString())
    } catch (err) {
      console.error("Error al cargar archivo:", err)
      setError("Error al cargar el plan de estudio. Verifique el formato del archivo.")
    } finally {
      setUploading(false)
      fileInputRef.current.value = ""
    }
  }

  const handleDeletePlan = async () => {
    if (!selectedPlan) return

    if (!window.confirm(`¿Está seguro que desea eliminar el plan ${selectedPlan.propuesta}?`)) return

    setLoading(true)
    setError(null)
    try {
      await planesEstudioService.eliminarPlan(selectedPlan.codigo)
      setSelectedPlan(null)
      setPlanesState("selectedPlan", null)
      await cargarPlanes()
      setUploadSuccess("Plan de estudio eliminado correctamente")
      setPlanesState("lastUpdate", new Date().toISOString())
    } catch (err) {
      console.error("Error al eliminar plan:", err)
      setError("No se pudo eliminar el plan de estudio. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerMaterias = () => {
    if (!selectedPlan) return
    setShowMateriasModal(true)
    setPlanesState("showMateriasModal", true)
  }

  const handleCloseMateriasModal = () => {
    setShowMateriasModal(false)
    setPlanesState("showMateriasModal", false)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="flex justify-between items-center mb-6">
<h2 className="text-2xl font-semibold text-blue-600 pb-2 border-b border-blue-300">
  Planes de Estudio
</h2>

        
      </div>

      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div className="flex flex-col relative">
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
            onClick={cargarPlanes}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Actualizar
          </button>

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

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>}
      {uploadSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">{uploadSuccess}</div>
      )}

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
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-4 text-left border-b border-gray-200 bg-gray-50 font-semibold text-gray-600">Código</th>
                <th className="px-4 py-4 text-left border-b border-gray-200 bg-gray-50 font-semibold text-gray-600">Propuesta</th>
                <th className="px-4 py-4 text-left border-b border-gray-200 bg-gray-50 font-semibold text-gray-600">Cantidad de Materias</th>
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
        )}
      </div>

      <MateriasModal isOpen={showMateriasModal} onClose={handleCloseMateriasModal} plan={selectedPlan} />
    </div>
  )
}