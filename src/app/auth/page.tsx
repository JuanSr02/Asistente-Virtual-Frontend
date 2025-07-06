"use client";

import { useState, useMemo } from "react";
import { supabase } from "@/supabaseClient";
import { CheckCircle, XCircle, Loader2 } from "lucide-react"; // Importamos un icono de carga

// --- TODA LA LÓGICA (ESTADOS, VALIDACIONES, HANDLERS) PERMANECE IDÉNTICA ---
export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nombre: "",
    apellido: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    nombre: "",
    apellido: "",
  });

  const validateField = (field: string, value: string) => {
    let error = "";
    switch (field) {
      case "email":
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Ingresa un email válido";
        }
        break;
      case "password":
        if (value.trim() && value.length < 8) {
          error = "La contraseña debe tener al menos 8 caracteres";
        }
        break;
      case "nombre":
        if (value.trim() && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = "El nombre solo puede contener letras y espacios";
        }
        break;
      case "apellido":
        if (value.trim() && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = "El apellido solo puede contener letras y espacios";
        }
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const hasValidForm = useMemo(() => {
    if (showForgotPassword) {
      return formData.email.trim() && !errors.email;
    } else if (isSignUp) {
      return (
        formData.email.trim() &&
        !errors.email &&
        formData.password.trim() &&
        !errors.password &&
        formData.nombre.trim() &&
        !errors.nombre &&
        formData.apellido.trim() &&
        !errors.apellido
      );
    } else {
      return (
        formData.email.trim() &&
        !errors.email &&
        formData.password.trim() &&
        !errors.password
      );
    }
  }, [formData, errors, isSignUp, showForgotPassword]);

  const handleEmailAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    const fieldsToValidate = Object.keys(formData) as Array<
      keyof typeof formData
    >;
    let hasErrors = false;
    for (const field of fieldsToValidate) {
      if (
        (isSignUp || (field !== "nombre" && field !== "apellido")) &&
        !showForgotPassword
      ) {
        const isValid = validateField(field, formData[field]);
        if (!isValid) hasErrors = true;
      }
    }
    if (hasErrors) return;
    setLoading(true);
    try {
      let result;
      if (isSignUp) {
        const { data: userExists } = await supabase
          .from("users")
          .select("email")
          .eq("email", formData.email)
          .single();
        if (userExists) {
          alert("Este email ya está registrado. Por favor inicia sesión.");
          setLoading(false);
          return;
        }
        result = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: `${formData.nombre} ${formData.apellido}` },
            emailRedirectTo: `${window.location.origin}`,
          },
        });
        if (result.data.user && result.data.user.identities?.length === 0) {
          alert("Este email ya está registrado. Por favor inicia sesión.");
          setLoading(false);
          return;
        }
      } else {
        result = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
      }
      if (result.error) {
        alert(result.error.message);
      } else {
        if (isSignUp) {
          alert("¡Revisa tu email para confirmar tu cuenta!");
          setIsSignUp(false);
        }
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error) alert("Error con Google: " + error.message);
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || errors.email) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        formData.email,
        { redirectTo: `${window.location.origin}/reset-password` }
      );
      if (error) {
        alert(error.message);
      } else {
        setResetEmailSent(true);
        alert("¡Revisa tu email para resetear tu contraseña!");
        setShowForgotPassword(false);
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderLoadingSpinner = () => (
    <Loader2 className="h-5 w-5 animate-spin" />
  );

  const inputClasses = (hasError: boolean, hasContent: boolean) =>
    `w-full h-11 px-4 border rounded-md bg-transparent text-sm transition-colors
     file:border-0 file:bg-transparent file:text-sm file:font-medium
     placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2
     focus-visible:ring-ring focus-visible:ring-offset-2
     disabled:cursor-not-allowed disabled:opacity-50
     ${hasError ? "border-destructive focus-visible:ring-destructive" : ""}
     ${!hasError && hasContent ? "border-success-500" : "border-input"}`;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div
          className="
            grid grid-cols-1 lg:grid-cols-5 bg-card text-card-foreground
            rounded-lg shadow-strong overflow-hidden border border-border
          "
        >
          {/* --- Panel izquierdo - Información --- */}
          <div className="col-span-1 lg:col-span-2 p-8 flex flex-col justify-between bg-muted/50">
            <div>
              <div className="text-center lg:text-left mb-8">
                <h1 className="text-3xl font-extrabold text-primary mb-2">
                  Asistente Virtual
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  Un soporte académico para estudiantes
                </p>
                <div className="flex justify-center lg:justify-start items-center gap-3 text-sm font-medium text-muted-foreground">
                  <span>UNSL</span>
                  <span className="text-border">|</span>
                  <span>Dpto. de Informática</span>
                </div>
              </div>
              <div className="flex justify-center gap-8 mb-8">
                <img
                  src="/logoUNSL.png"
                  alt="Logo UNSL"
                  className="h-16 object-contain"
                />
                <img
                  src="/logoDptoInfo.png"
                  alt="Logo Dpto Informática"
                  className="h-16 object-contain"
                />
              </div>
            </div>

            <div className="mt-auto">
              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full h-11 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors
                           border border-input bg-background hover:bg-accent hover:text-accent-foreground
                           disabled:pointer-events-none disabled:opacity-50"
              >
                {loading ? (
                  renderLoadingSpinner()
                ) : (
                  <>
                    <img
                      src="/logoGoogle.png"
                      alt="Google Logo"
                      className="h-5 mr-3"
                    />
                    Continuar con Google
                  </>
                )}
              </button>
            </div>
          </div>

          {/* --- Panel derecho - Formularios --- */}
          <div className="col-span-1 lg:col-span-3 p-8 flex flex-col justify-center">
            {showForgotPassword ? (
              // --- Panel recuperación contraseña ---
              <form onSubmit={handlePasswordReset} className="w-full space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-primary">
                    Recuperar Contraseña
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Ingresa tu email para recibir un enlace de recuperación.
                  </p>
                </div>
                <div>
                  <label htmlFor="reset-email" className="text-sm font-medium">
                    Email
                  </label>
                  <div className="relative mt-2">
                    <input
                      id="reset-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                      placeholder="tu@email.com"
                      className={inputClasses(!!errors.email, !!formData.email)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5">
                      {errors.email ? (
                        <XCircle className="text-destructive" />
                      ) : (
                        formData.email && (
                          <CheckCircle className="text-success-500" />
                        )
                      )}
                    </div>
                  </div>
                  {errors.email && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading || !hasValidForm}
                  className="w-full h-11 inline-flex items-center justify-center rounded-md text-sm font-semibold text-primary-foreground
                             bg-primary hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? renderLoadingSpinner() : "Enviar enlace"}
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="text-sm text-primary hover:underline"
                  >
                    Volver a Iniciar Sesión
                  </button>
                </div>
              </form>
            ) : isSignUp ? (
              // --- Panel registro ---
              <form onSubmit={handleEmailAuth} className="w-full space-y-4">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-primary">
                    Crear Cuenta
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Completa los datos para empezar.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nombre</label>
                    <div className="relative mt-2">
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) =>
                          handleInputChange("nombre", e.target.value)
                        }
                        required
                        placeholder="Juan"
                        className={inputClasses(
                          !!errors.nombre,
                          !!formData.nombre
                        )}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5">
                        {errors.nombre ? (
                          <XCircle className="text-destructive" />
                        ) : (
                          formData.nombre && (
                            <CheckCircle className="text-success-500" />
                          )
                        )}
                      </div>
                    </div>
                    {errors.nombre && (
                      <p className="text-destructive text-xs mt-1">
                        {errors.nombre}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Apellido</label>
                    <div className="relative mt-2">
                      <input
                        type="text"
                        value={formData.apellido}
                        onChange={(e) =>
                          handleInputChange("apellido", e.target.value)
                        }
                        required
                        placeholder="Pérez"
                        className={inputClasses(
                          !!errors.apellido,
                          !!formData.apellido
                        )}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5">
                        {errors.apellido ? (
                          <XCircle className="text-destructive" />
                        ) : (
                          formData.apellido && (
                            <CheckCircle className="text-success-500" />
                          )
                        )}
                      </div>
                    </div>
                    {errors.apellido && (
                      <p className="text-destructive text-xs mt-1">
                        {errors.apellido}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <div className="relative mt-2">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                      placeholder="tu@email.com"
                      className={inputClasses(!!errors.email, !!formData.email)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5">
                      {errors.email ? (
                        <XCircle className="text-destructive" />
                      ) : (
                        formData.email && (
                          <CheckCircle className="text-success-500" />
                        )
                      )}
                    </div>
                  </div>
                  {errors.email && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Contraseña</label>
                  <div className="relative mt-2">
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      required
                      placeholder="••••••••"
                      className={inputClasses(
                        !!errors.password,
                        !!formData.password
                      )}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5">
                      {errors.password ? (
                        <XCircle className="text-destructive" />
                      ) : (
                        formData.password && (
                          <CheckCircle className="text-success-500" />
                        )
                      )}
                    </div>
                  </div>
                  {errors.password && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading || !hasValidForm}
                  className="w-full h-11 inline-flex items-center justify-center rounded-md text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? renderLoadingSpinner() : "Registrarse"}
                </button>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    ¿Ya tienes cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(false)}
                      className="font-semibold text-primary hover:underline"
                    >
                      Inicia Sesión
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              // --- Panel login (por defecto) ---
              <form onSubmit={handleEmailAuth} className="w-full space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-primary">
                    Iniciar Sesión
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Bienvenido de nuevo.
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <div className="relative mt-2">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                      placeholder="tu@email.com"
                      className={inputClasses(!!errors.email, !!formData.email)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5">
                      {errors.email ? (
                        <XCircle className="text-destructive" />
                      ) : (
                        formData.email && (
                          <CheckCircle className="text-success-500" />
                        )
                      )}
                    </div>
                  </div>
                  {errors.email && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Contraseña</label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs text-primary hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative mt-2">
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      required
                      placeholder="••••••••"
                      className={inputClasses(
                        !!errors.password,
                        !!formData.password
                      )}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5">
                      {errors.password ? (
                        <XCircle className="text-destructive" />
                      ) : (
                        formData.password && (
                          <CheckCircle className="text-success-500" />
                        )
                      )}
                    </div>
                  </div>
                  {errors.password && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading || !hasValidForm}
                  className="w-full h-11 inline-flex items-center justify-center rounded-md text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? renderLoadingSpinner() : "Iniciar Sesión"}
                </button>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    ¿No tienes cuenta?{" "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="font-semibold text-primary hover:underline"
                    >
                      Regístrate
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
