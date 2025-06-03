"use client"

import { useState } from "react"
import { supabase } from "../supabaseClient"

// Este componente maneja tanto el login como el registro
export default function Auth() {
  // Estados para controlar el formulario
  const [loading, setLoading] = useState(false) // Para mostrar "cargando"
  const [email, setEmail] = useState("") // Email del usuario
  const [password, setPassword] = useState("") // Contraseña del usuario
  const [isSignUp, setIsSignUp] = useState(false) // Si está en modo registro o login

  // Función para manejar el login con email y contraseña
  const handleEmailAuth = async (event) => {
    event.preventDefault() // Evita que el formulario recargue la página
    setLoading(true)

    try {
      let result
      if (isSignUp) {
        // Si está en modo registro, crea una nueva cuenta
        result = await supabase.auth.signUp({
          email: email,
          password: password,
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
          alert("¡Sesión iniciada correctamente!")
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
          redirectTo: window.location.origin, // Redirige de vuelta a tu app
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
    <div className="auth-container">
      <div className="auth-card">
        <h1>{isSignUp ? "Crear Cuenta" : "Iniciar Sesión"}</h1>

        {/* Formulario para email y contraseña */}
        <form onSubmit={handleEmailAuth} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input
              id="password"
              type="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <button type="submit" disabled={loading} className="auth-button primary">
            {loading ? "Cargando..." : isSignUp ? "Registrarse" : "Iniciar Sesión"}
          </button>
        </form>

        {/* Separador visual */}
        <div className="separator">
          <span>O</span>
        </div>

        {/* Botón para Google */}
        <button onClick={handleGoogleAuth} disabled={loading} className="auth-button google">
          {loading ? "Cargando..." : "Continuar con Google"}
        </button>

        {/* Botón para cambiar entre login y registro */}
        <div className="toggle-mode">
          <p>
            {isSignUp ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="link-button">
              {isSignUp ? "Inicia Sesión" : "Regístrate"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
