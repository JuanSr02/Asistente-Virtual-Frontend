"use client"

import { useState } from "react"
import { supabase } from "@/supabaseClient"

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  const handleEmailAuth = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      let result
      if (isSignUp) {
        if (!nombre.trim() || !apellido.trim()) {
          alert("Por favor complete todos los campos")
          setLoading(false)
          return
        }

        const { data: userExists } = await supabase
          .from("users")
          .select("email")
          .eq("email", email)
          .single()

        if (userExists) {
          alert("Este email ya está registrado. Por favor inicia sesión.")
          setLoading(false)
          return
        }

        result = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              full_name: `${nombre} ${apellido}`,
            },
            emailRedirectTo: `${window.location.origin}`,
          },
        })

        if (result.data.user && result.data.user.identities?.length === 0) {
          alert("Este email ya está registrado. Por favor inicia sesión.")
          setLoading(false)
          return
        }
      } else {
        result = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        })
      }

      if (result.error) {
        alert(result.error.message)
      } else {
        if (isSignUp) {
          alert("¡Revisa tu email para confirmar tu cuenta!")
          setIsSignUp(false)
          setShowLogin(true)
        } else {
          console.log("Sesión iniciada correctamente")
        }
      }
    } catch (error) {
      alert("Error: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "https://qlbpcnyjsvhxnncjorku.supabase.co/auth/v1/callback",
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          skippable: false,
          domain: "Asistente-Virtual",
        },
      })
      if (error) alert("Error con Google: " + error.message)
    } catch (error) {
      alert("Error: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        alert(error.message)
      } else {
        setResetEmailSent(true)
      }
    } catch (error) {
      alert("Error: " + error.message)
    } finally {
      setLoading(false)
      alert("¡Revisa tu email para resetear tu contraseña!")
      setShowForgotPassword(false)
      setShowLogin(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-7xl mx-auto flex justify-start">
        <div className="flex items-stretch">
          {/* Panel izquierdo */}
          <div className="bg-white p-10 rounded-l-2xl shadow-xl border border-gray-100 w-96 flex-shrink-0 flex flex-col justify-between min-h-[600px]">
            <div>
              <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-3">
                  Asistente Virtual
                </h1>
                <h2 className="text-2xl font-semibold text-indigo-800 mb-2">Soporte Académico</h2>
                <div className="flex justify-center items-center gap-4 mt-4">
                  <span className="text-lg font-medium text-indigo-600">UNSL</span>
                  <span className="text-indigo-300">|</span>
                  <span className="text-lg font-medium text-indigo-600">Dpto Informática</span>
                </div>
              </div>
              <div className="flex justify-center gap-12 mb-10">
                <img src="logoUNSL.png" alt="Logo UNSL" className="h-20 object-contain" />
                <img src="logoDptoInfo.png" alt="Logo Dpto Informática" className="h-20 object-contain" />
              </div>
            </div>
            <div>
              {!showLogin && !showForgotPassword &&  (
                <button
                  onClick={() => setShowLogin(true)}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-lg font-semibold transition-all shadow-md hover:shadow-lg mb-8"
                >
                  Iniciar Sesión
                </button>
              )}
              {(
                <button
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full py-3.5 bg-white hover:bg-gray-50 border-2 border-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 rounded-xl text-base font-semibold transition-colors flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
                >
                  <img src="logoGoogle.png" alt="Google Logo" className="h-6" />
                  Continuar con Google
                </button>
              )}
            </div>
          </div>

          {/* Panel recuperación contraseña */}
          {showForgotPassword && (
  <div className="bg-white p-10 rounded-r-2xl shadow-xl border-t border-r border-b border-gray-100 w-96 flex-shrink-0 min-h-[600px] flex flex-col justify-center -ml-px">
    <form onSubmit={handlePasswordReset} className="flex flex-col justify-between h-full">
      <div>
        <h1 className="text-center mb-10 text-[1.625rem] font-bold text-gray-800">
          <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Recuperar Contraseña
          </span>
        </h1>

        <div className="mb-6">
          <label htmlFor="reset-email" className="block mb-3 text-lg font-medium text-gray-700">
            Email:
          </label>
          <input
            id="reset-email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-4 border-2 border-blue-200 bg-blue-50/30 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl text-lg font-semibold transition-all shadow-md hover:shadow-lg mb-4"
        >
          {loading ? "Enviando..." : "Enviar enlace de recuperación"}
        </button>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => {
              setShowForgotPassword(false)
              setShowLogin(true)
            }}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    </form>
  </div>
)}


          {/* Panel login */}
          {showLogin && !isSignUp && !showForgotPassword && (
            <div className="bg-white p-8 rounded-r-2xl shadow-xl border-t border-r border-b border-gray-100 w-96 flex-shrink-0 min-h-[600px] flex flex-col justify-center -ml-px">
              <form onSubmit={handleEmailAuth} className="mb-6">
                <h1 className="text-center mb-8 text-3xl font-bold text-gray-800">
                  <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Iniciar Sesión
                  </span>
                </h1>
                <div className="mb-6">
                  <label htmlFor="email" className="block mb-3 text-lg font-medium text-gray-700">
                    Email:
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-4 border-2 border-blue-200 bg-blue-50/30 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white transition-all"
                  />
                </div>
                <div className="mb-8">
                  <label htmlFor="password" className="block mb-3 text-lg font-medium text-gray-700">
                    Contraseña:
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-4 border-2 border-blue-200 bg-blue-50/30 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white transition-all"
                  />
                </div>
                <div className="text-right mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true)
                      setShowLogin(false)
                    }}
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl text-lg font-semibold transition-all shadow-md hover:shadow-lg mb-4"
                >
                  {loading ? "Cargando..." : "Iniciar Sesión"}
                </button>
                <div className="text-center mt-6">
                  <p className="text-gray-600 text-lg">
                    ¿No tienes cuenta?
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="ml-2 text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-4 transition-colors"
                    >
                      Regístrate
                    </button>
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* Panel registro con campos alineados */}
          {isSignUp && showLogin && !showForgotPassword && (
            <div className="bg-white p-10 rounded-r-2xl shadow-xl border-t border-r border-b border-gray-100 w-[48rem] flex-shrink-0 min-h-[600px] flex flex-col justify-center -ml-px">
              <form onSubmit={handleEmailAuth} className="flex flex-col h-full justify-between">
                <div>
                  <h2 className="text-center mb-10 text-3xl font-bold text-gray-800">
                    <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      Crear Cuenta
                    </span>
                  </h2>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="block mb-3 text-lg font-medium text-gray-700">Email:</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-4 border-2 border-blue-200 bg-blue-50/30 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block mb-3 text-lg font-medium text-gray-700">Nombre:</label>
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        className="w-full px-4 py-4 border-2 border-green-200 bg-green-50/30 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block mb-3 text-lg font-medium text-gray-700">Contraseña:</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-4 border-2 border-blue-200 bg-blue-50/30 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block mb-3 text-lg font-medium text-gray-700">Apellido:</label>
                      <input
                        type="text"
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        required
                        className="w-full px-4 py-4 border-2 border-green-200 bg-green-50/30 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-10">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl text-lg font-semibold transition-all shadow-md hover:shadow-lg mb-6"
                  >
                    {loading ? "Cargando..." : "Registrarse"}
                  </button>
                  <div className="text-center">
                    <p className="text-gray-600 text-lg">
                      ¿Ya tienes cuenta?
                      <button
                        type="button"
                        onClick={() => setIsSignUp(false)}
                        className="ml-2 text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-4 transition-colors"
                      >
                        Inicia Sesión
                      </button>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
