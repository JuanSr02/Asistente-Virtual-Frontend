"use client"

import { useState } from "react"
import { supabase } from "../../supabaseClient"
import { useRouter } from "next/navigation"

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()

  const handleReset = async (e) => {
    e.preventDefault()
    setErrorMessage("")

    if (newPassword !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setErrorMessage(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push("/") // redirige al login o dashboard
      }, 3000)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-2">
              Restablecer Contraseña
            </h1>
            <p className="text-gray-600">Ingresá tu nueva contraseña</p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
                ¡Contraseña actualizada con éxito! Serás redirigido...
              </div>
              <button
                onClick={() => router.push("/")}
                className="text-blue-500 hover:text-blue-700 font-medium"
              >
                Volver al inicio
              </button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="new-password" className="block mb-2 text-lg font-medium text-gray-700">
                    Nueva Contraseña:
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block mb-2 text-lg font-medium text-gray-700">
                    Confirmar Contraseña:
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                    placeholder="Repetí tu contraseña"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl text-lg font-semibold transition-all shadow-md hover:shadow-lg"
              >
                {loading ? "Actualizando..." : "Actualizar Contraseña"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}