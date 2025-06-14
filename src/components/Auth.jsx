"use client"

import { useState } from "react"
import { supabase } from "../supabaseClient"

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

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

        result = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              full_name: `${nombre} ${apellido}`,
            },
          },
        })
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
          // Esto afecta cómo se muestra en algunos casos
        skippable: false,
        domain: "Asistente-Virtual" // Agrega un dominio institucional si tienes
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

  return (
    <div className="w-full max-w-md mx-auto p-8">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        {/* Título estético */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent mb-2">
            Asistente Virtual
          </h1>
          <h2 className="text-xl font-semibold text-gray-700">Soporte Académico</h2>
          <div className="flex justify-center items-center gap-4 mt-4">
            <span className="text-gray-600">UNSL</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">Dpto Informática</span>
          </div>
        </div>

        {/* Logos */}
        <div className="flex justify-center gap-8 mb-8">
          <img src="logoUNSL.png" alt="Logo UNSL" className="h-16 object-contain" />
          <img src="logoDptoInfo.png" alt="Logo Dpto Informática" className="h-16 object-contain" />
        </div>

        {/* Botón para mostrar inicio de sesión */}
        {!showLogin && (
          <button
            onClick={() => setShowLogin(true)}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-base font-medium transition-colors mb-6"
          >
            Iniciar Sesión
          </button>
        )}

        {/* Botón de Google (siempre visible) */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full py-3 bg-white hover:bg-gray-50 border border-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 rounded-lg text-base font-medium transition-colors flex items-center justify-center gap-2"
        >
          <img src="logoGoogle.png" alt="Google Logo" className="h-5" />
          Continuar con Google
        </button>

        {/* Formulario de inicio de sesión (oculto inicialmente) */}
        {showLogin && (
          <>
            <form onSubmit={handleEmailAuth} className="mt-6 mb-6">
              <h1 className="text-center mb-6 text-2xl font-bold text-gray-800">
                {isSignUp ? "Crear Cuenta" : "Iniciar Sesión"}
              </h1>

              {isSignUp && (
                <>
                  <div className="mb-4">
                    <label htmlFor="nombre" className="block mb-2 font-medium text-gray-600">
                      Nombre:
                    </label>
                    <input
                      id="nombre"
                      type="text"
                      placeholder="Tu nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                      className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="apellido" className="block mb-2 font-medium text-gray-600">
                      Apellido:
                    </label>
                    <input
                      id="apellido"
                      type="text"
                      placeholder="Tu apellido"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      required
                      className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              <div className="mb-4">
                <label htmlFor="email" className="block mb-2 font-medium text-gray-600">
                  Email:
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block mb-2 font-medium text-gray-600">
                  Contraseña:
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-base font-medium transition-colors mb-2"
              >
                {loading ? "Cargando..." : isSignUp ? "Registrarse" : "Iniciar Sesión"}
              </button>
            </form>

            <div className="text-center mt-4">
              <p className="text-gray-500">
                {isSignUp ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-blue-500 hover:text-blue-600 underline ml-2 bg-none border-none cursor-pointer"
                >
                  {isSignUp ? "Inicia Sesión" : "Regístrate"}
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}