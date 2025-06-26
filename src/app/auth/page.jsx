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

        // Primero verificamos si el usuario ya existe
        const { data: userExists } = await supabase
          .from('users')
          .select('email')
          .eq('email', email)
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
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        })

        // Verificación adicional para usuarios ya registrados
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
          domain: "Asistente-Virtual"
        },
      })
      if (error) {
        alert("Error con Google: " + error.message)
      }
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
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
          {/* Título mejorado */}
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

          {/* Logos */}
          <div className="flex justify-center gap-12 mb-10">
            <img src="logoUNSL.png" alt="Logo UNSL" className="h-20 object-contain" />
            <img src="logoDptoInfo.png" alt="Logo Dpto Informática" className="h-20 object-contain" />
          </div>

          {/* Botón para mostrar inicio de sesión */}
          {!showLogin && !showForgotPassword && (
            <button
              onClick={() => setShowLogin(true)}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-lg font-semibold transition-all shadow-md hover:shadow-lg mb-8"
            >
              Iniciar Sesión
            </button>
          )}

          {/* Botón de Google (visible siempre excepto en recuperación) */}
          {!showForgotPassword && (
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full py-3.5 bg-white hover:bg-gray-50 border-2 border-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 rounded-xl text-base font-semibold transition-colors flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
            >
              <img src="logoGoogle.png" alt="Google Logo" className="h-6" />
              Continuar con Google
            </button>
          )}

          {/* Formulario de recuperación de contraseña */}
          {showForgotPassword && (
            <form onSubmit={handlePasswordReset} className="mt-8 mb-6">
              <h1 className="text-center mb-8 text-3xl font-bold text-gray-800">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Recuperar Contraseña
                </span>
              </h1>

              {resetEmailSent ? (
                <div className="text-center">
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
                    ¡Correo enviado! Revisa tu bandeja de entrada para restablecer tu contraseña.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false)
                      setResetEmailSent(false)
                    }}
                    className="text-blue-500 hover:text-blue-700 font-medium"
                  >
                    Volver al inicio de sesión
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-5">
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
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                    />
                  </div>

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
                      onClick={() => setShowForgotPassword(false)}
                      className="text-blue-500 hover:text-blue-700 font-medium"
                    >
                      Volver al inicio de sesión
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {/* Formulario de inicio de sesión/registro */}
          {showLogin && !showForgotPassword && (
            <>
              <form onSubmit={handleEmailAuth} className="mt-8 mb-6">
                <h1 className="text-center mb-8 text-3xl font-bold text-gray-800">
                  {isSignUp ? (
                    <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      Crear Cuenta
                    </span>
                  ) : (
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Iniciar Sesión
                    </span>
                  )}
                </h1>

                {isSignUp && (
                  <>
                    <div className="mb-5">
                      <label htmlFor="nombre" className="block mb-3 text-lg font-medium text-gray-700">
                        Nombre:
                      </label>
                      <input
                        id="nombre"
                        type="text"
                        placeholder="Tu nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="mb-5">
                      <label htmlFor="apellido" className="block mb-3 text-lg font-medium text-gray-700">
                        Apellido:
                      </label>
                      <input
                        id="apellido"
                        type="text"
                        placeholder="Tu apellido"
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                      />
                    </div>
                  </>
                )}

                <div className="mb-5">
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                  />
                </div>

                <div className="mb-6">
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
                  />
                </div>

                {!isSignUp && (
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
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl text-lg font-semibold transition-all shadow-md hover:shadow-lg mb-4"
                >
                  {loading ? "Cargando..." : isSignUp ? "Registrarse" : "Iniciar Sesión"}
                </button>
              </form>

              <div className="text-center mt-6">
                <p className="text-gray-600 text-lg">
                  {isSignUp ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="ml-2 text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-4 transition-colors"
                  >
                    {isSignUp ? "Inicia Sesión" : "Regístrate"}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}