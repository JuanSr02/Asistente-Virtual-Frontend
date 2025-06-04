"use client"

import { useState } from "react"
import { supabase } from "../supabaseClient"

// Componente para probar la conexión con Supabase
export default function TestConnection() {
  const [testResult, setTestResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const testSupabaseConnection = async () => {
    setLoading(true)
    setTestResult(null)

    try {
      // Probar conexión básica
      const { data, error } = await supabase.from("persona").select("count", { count: "exact" })

      if (error) {
        setTestResult({
          success: false,
          message: `Error de conexión: ${error.message}`,
          details: error,
        })
      } else {
        setTestResult({
          success: true,
          message: `Conexión exitosa. Registros en tabla persona: ${data.length}`,
          details: data,
        })
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: `Error: ${err.message}`,
        details: err,
      })
    } finally {
      setLoading(false)
    }
  }

  const testTableStructure = async () => {
    setLoading(true)
    setTestResult(null)

    try {
      // Probar estructura de la tabla
      const { data, error } = await supabase.from("persona").select("*").limit(1)

      if (error) {
        setTestResult({
          success: false,
          message: `Error consultando tabla: ${error.message}`,
          details: error,
        })
      } else {
        setTestResult({
          success: true,
          message: "Tabla persona accesible",
          details: data,
        })
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: `Error: ${err.message}`,
        details: err,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="test-connection">
      <h3>🔧 Pruebas de Conexión</h3>
      <div className="test-buttons">
        <button onClick={testSupabaseConnection} disabled={loading} className="test-button">
          {loading ? "Probando..." : "Probar Conexión"}
        </button>
        <button onClick={testTableStructure} disabled={loading} className="test-button">
          {loading ? "Probando..." : "Probar Tabla"}
        </button>
      </div>

      {testResult && (
        <div className={`test-result ${testResult.success ? "success" : "error"}`}>
          <h4>{testResult.success ? "✅ Éxito" : "❌ Error"}</h4>
          <p>{testResult.message}</p>
          <details>
            <summary>Detalles técnicos</summary>
            <pre>{JSON.stringify(testResult.details, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  )
}
