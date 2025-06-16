"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "../../supabaseClient"
import Link from "next/link"

export default function ResetPassword() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(null) // null = checking, true = valid, false = invalid

  // Verificar el token al cargar la página
  useEffect(() => {
    const checkToken = async () => {
      const token = searchParams.get('token')
      if (!token) {
        setTokenValid(false)
        return
      }

      try {
        // Verificar el token con Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'recovery'
        })

        if (error) {
          console.error("Error verificando token:", error)
          setTokenValid(false)
        } else {
          setTokenValid(true)
        }
      } catch (err) {
        console.error("Error verificando token:", err)
        setTokenValid(false)
      }
    }

    checkToken()
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setLoading(true)
    const token = searchParams.get('token')

    try {
      // Actualizar la contraseña usando el token
      const { error } = await supabase.auth.updateUser({
        password: password
      }, {
        token: token
      })

      if (error) {
        throw error
      }

      setSuccess(true)
      // Redirigir después de 3 segundos
      setTimeout(() => {
        router.push("/auth")
      }, 3000)
    } catch (error) {
      console.error("Error actualizando contraseña:", error)
      setError(error.message || "Ocurrió un error al actualizar la contraseña")
    } finally {
      setLoading(false)
    }
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Verificando enlace...</h1>
            <p className="text-gray-600">Por favor espera mientras verificamos tu enlace de recuperación.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Enlace inválido o expirado</h1>
            <p className="text-gray-600 mb-6">
              El enlace de recuperación no es válido o ha expirado. Por favor solicita un nuevo enlace.
            </p>
            <Link 
              href="/auth" 
              className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">¡Contraseña actualizada!</h1>
            <p className="text-gray-600 mb-6">
              Tu contraseña ha sido actualizada correctamente. Serás redirigido al inicio de sesión.
            </p>
            <Link 
              href="/auth" 
              className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Ir al inicio de sesión ahora
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Restablecer contraseña</h1>
          <p className="text-gray-600">Ingresa tu nueva contraseña</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
              Nueva contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-2">
              Confirmar nueva contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Repite tu contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </form>
      </div>
    </div>
  )
}