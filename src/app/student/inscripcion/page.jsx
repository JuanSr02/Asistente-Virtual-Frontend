"use client"

import { useState, useEffect } from "react"

export default function Inscripcion({ user }) {
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([])
  const [materiasDisponibles, setMateriasDisponibles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga de materias disponibles
    const fetchMaterias = async () => {
      setLoading(true)
      try {
        // Aquí harías la llamada a tu API
        setTimeout(() => {
          setMateriasDisponibles([
            {
              id: 1,
              nombre: "Cálculo I",
              codigo: "CAL101",
              creditos: 4,
              horario: "Lun-Mie-Vie 8:00-10:00",
              profesor: "Dr. García",
              cupos: 25,
            },
            {
              id: 2,
              nombre: "Física I",
              codigo: "FIS101",
              creditos: 5,
              horario: "Mar-Jue 10:00-12:00",
              profesor: "Dra. López",
              cupos: 30,
            },
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error al cargar materias:", error)
        setLoading(false)
      }
    }

    fetchMaterias()
  }, [user])

  const agregarMateria = (materia) => {
    if (!materiasSeleccionadas.find((m) => m.id === materia.id)) {
      setMateriasSeleccionadas([...materiasSeleccionadas, materia])
    }
  }

  const removerMateria = (materiaId) => {
    setMateriasSeleccionadas(materiasSeleccionadas.filter((m) => m.id !== materiaId))
  }

  const totalCreditos = materiasSeleccionadas.reduce((sum, materia) => sum + materia.creditos, 0)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Cargando materias disponibles...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">✏️ Inscripción a Materias</h2>
        <p className="text-gray-600">Selecciona las materias para el próximo período académico</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Materias Disponibles */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Materias Disponibles</h3>
          <div className="space-y-3">
            {materiasDisponibles.map((materia) => (
              <div key={materia.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{materia.nombre}</h4>
                    <p className="text-sm text-gray-600">
                      {materia.codigo} • {materia.creditos} créditos
                    </p>
                  </div>
                  <button
                    onClick={() => agregarMateria(materia)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    disabled={materiasSeleccionadas.find((m) => m.id === materia.id)}
                  >
                    {materiasSeleccionadas.find((m) => m.id === materia.id) ? "Agregada" : "Agregar"}
                  </button>
                </div>
                <p className="text-sm text-gray-600">{materia.horario}</p>
                <p className="text-sm text-gray-600">
                  Prof. {materia.profesor} • {materia.cupos} cupos
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Materias Seleccionadas */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Materias Seleccionadas ({totalCreditos} créditos)
          </h3>
          {materiasSeleccionadas.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No has seleccionado ninguna materia</p>
          ) : (
            <div className="space-y-3">
              {materiasSeleccionadas.map((materia) => (
                <div key={materia.id} className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{materia.nombre}</h4>
                      <p className="text-sm text-gray-600">
                        {materia.codigo} • {materia.creditos} créditos
                      </p>
                    </div>
                    <button
                      onClick={() => removerMateria(materia.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Remover
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">{materia.horario}</p>
                </div>
              ))}
              <div className="pt-4 border-t">
                <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-colors">
                  Confirmar Inscripción ({totalCreditos} créditos)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
