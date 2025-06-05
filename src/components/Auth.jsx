"use client"

import { useState } from "react"
import { supabase } from "../supabaseClient"

// Este componente maneja tanto el login como el registro
export default function Auth() {
  <script src="https://accounts.google.com/gsi/client" async></script>
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
          {/* Campos adicionales para registro */}
          {isSignUp && (
            <>
              <div className="form-group">
                <label htmlFor="nombre">Nombre:</label>
                <input
                  id="nombre"
                  type="text"
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="apellido">Apellido:</label>
                <input
                  id="apellido"
                  type="text"
                  placeholder="Tu apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  required
                  className="form-input"
                />
              </div>
            </>
          )}

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
