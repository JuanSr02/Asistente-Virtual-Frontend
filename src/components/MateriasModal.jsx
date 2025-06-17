"use client"

import { useState, useEffect } from "react"
import Modal from "./Modal"
import planesEstudioService from "../services/planesEstudioService"
import { MateriaListSkeleton } from "./Skeleton"

export default function MateriasModal({ isOpen, onClose, plan }) {
  const [materias, setMaterias] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false)

  useEffect(() => {
    if (isOpen && plan) {
      const cacheKey = `materias_${plan.codigo}`

      // Si ya se cargaron antes, evitamos recargar (y no mostramos skeleton)
      const saved = sessionStorage.getItem(cacheKey)
      if (saved) {
        setMaterias(JSON.parse(saved))
        setLoading(false)
        setError(null)
        setHasFetchedOnce(true)
        return
      }

      // Si nunca se cargaron, ahora sí las cargamos
      cargarMaterias(plan.codigo)
    }
  }, [isOpen, plan])

  const cargarMaterias = async (codigo) => {
    setLoading(true)
    setError(null)
    try {
      const data = await planesEstudioService.obtenerMateriasPorPlan(codigo)
      setMaterias(data)
      sessionStorage.setItem(`materias_${codigo}`, JSON.stringify(data))
      setHasFetchedOnce(true)
    } catch (err) {
      console.error("Error al cargar materias:", err)
      setError("No se pudieron cargar las materias del plan.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Materias del Plan: ${plan?.propuesta || ""} (${plan?.codigo || ""})`} 
      maxWidth="50rem"
    >
      <div className="min-h-[18.75rem]">
        {loading && !hasFetchedOnce ? (
          <MateriaListSkeleton count={12} />
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => cargarMaterias(plan.codigo)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : materias.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4 opacity-50">📚</div>
            <h4 className="text-xl text-gray-600 mb-2 font-semibold">No hay materias registradas</h4>
            <p className="text-gray-500">Este plan de estudio no tiene materias cargadas en el sistema.</p>
          </div>
        ) : (
          <div>
            <div className="mb-6 pb-4 border-b border-gray-200">
              <span className="text-sm text-gray-600 font-medium">
                {materias.length} materia{materias.length !== 1 ? "s" : ""} encontrada{materias.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {materias.map((materia, index) => (
                <div
                  key={materia.codigo}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-200 hover:bg-gray-100 hover:border-blue-500 transition-all duration-200 transform hover:translate-x-0.5"
                >
                  <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 mb-1">{materia.nombre}</div>
                    <div className="text-sm text-gray-500">Código: {materia.codigo}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
