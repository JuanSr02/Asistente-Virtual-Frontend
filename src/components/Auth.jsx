"use client"

import { useState } from "react"
import { supabase } from "../supabaseClient"

// Este componente maneja tanto el login como el registro
export default function Auth() {
  // Estados para controlar el formulario
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)

  // Función para manejar el login con email y contraseña
  const handleEmailAuth = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      let result
      if (isSignUp) {
        // Validar que se hayan completado todos los campos
        if (!nombre.trim() || !apellido.trim()) {
          alert("Por favor complete todos los campos")
          setLoading(false)
          return
        }

        // Si está en modo registro, crea una nueva cuenta
        result = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              full_name: `${nombre} ${apellido}`, // Guardar nombre completo
            },
          },
        })
      } else {
        // Si está en modo login, inicia sesión
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

  // Función para manejar el login con Google
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
        <h1 className="text-center mb-8 text-2xl font-bold text-gray-800">
          {isSignUp ? "Crear Cuenta" : "Iniciar Sesión"}
        </h1>

        {/* Formulario para email y contraseña */}
        <form onSubmit={handleEmailAuth} className="mb-6">
          {/* Campos adicionales para registro */}
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

        {/* Separador visual */}
        <div className="text-center my-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <span className="bg-white px-4 text-gray-400 relative">O</span>
        </div>

        {/* Botón para Google */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-base font-medium transition-colors"
        >
          {loading ? "Cargando..." : "Continuar con Google"}
        </button>

        {/* Botón para cambiar entre login y registro */}
        <div className="text-center mt-6">
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
      </div>
    </div>
  )
}
