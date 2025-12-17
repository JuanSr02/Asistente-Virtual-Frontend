"use client";

import { useState } from "react";
import { supabase } from "@/supabaseClient";
import { Loader2 } from "lucide-react";
import { loginSchema, registerSchema } from "@/lib/schemas/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    apellido: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error al escribir
    if (errors[field]) {
      setErrors((prev) => {
        const newV = { ...prev };
        delete newV[field];
        return newV;
      });
    }
  };

  const validateForm = () => {
    try {
      if (showForgotPassword) {
        loginSchema.pick({ email: true }).parse({ email: formData.email });
      } else if (isSignUp) {
        registerSchema.parse(formData);
      } else {
        loginSchema.parse({
          email: formData.email,
          password: formData.password,
        });
      }
      setErrors({});
      return true;
    } catch (error: any) {
      if (error.errors) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          if (err.path[0]) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (showForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(
          formData.email,
          { redirectTo: `${window.location.origin}/reset-password` }
        );
        if (error) throw error;
        toast.success("¡Revisa tu email para restablecer tu contraseña!");
        setShowForgotPassword(false);
      } else if (isSignUp) {
        const { data: userExists } = await supabase
          .from("users")
          .select("email")
          .eq("email", formData.email)
          .single();

        if (userExists) {
          toast.warning(
            "Este email ya está registrado. Por favor inicia sesión."
          );
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: `${formData.nombre} ${formData.apellido}` },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        if (data.user && data.user.identities?.length === 0) {
          toast.warning(
            "Este email ya está registrado. Por favor inicia sesión."
          );
        } else {
          toast.success("¡Cuenta creada! Revisa tu email para confirmar.");
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;

        toast.success("¡Bienvenido!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error inesperado");
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
      if (error) throw error;
      router.refresh();
    } catch (error: any) {
      toast.error("Error con Google: " + error.message);
      setLoading(false);
    }
  };

  const renderLoadingSpinner = () => (
    <Loader2 className="h-5 w-5 animate-spin" />
  );

  const inputClasses = (fieldName: string) => {
    const hasError = !!errors[fieldName];
    // @ts-ignore
    const hasContent = !!formData[fieldName];

    return `w-full h-11 px-4 border-2 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 text-foreground text-sm 
     transition-all focus:bg-background dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600
     ${hasError ? "border-red-500 dark:border-red-700" : ""}
     ${!hasError && hasContent ? "border-green-500 dark:border-green-600" : "border-blue-200 dark:border-blue-800"}`;
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 bg-background text-foreground rounded-2xl shadow-2xl overflow-hidden border border-border">
          {/* --- Panel Izquierdo --- */}
          <div className="col-span-1 lg:col-span-2 p-8 flex flex-col justify-between bg-gradient-to-b from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white">
            <div>
              <div className="text-center lg:text-left mb-8">
                <h1 className="text-3xl font-extrabold mb-2">
                  Asistente Virtual
                </h1>
                <p className="text-lg text-indigo-100 dark:text-indigo-200 mb-4">
                  Un soporte académico para estudiantes
                </p>
                <div className="flex justify-center lg:justify-start items-center gap-3 text-sm font-medium text-indigo-200 dark:text-indigo-300">
                  <span>UNSL</span>
                  <span className="text-blue-300 dark:text-blue-400">|</span>
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
                className="w-full h-11 inline-flex items-center justify-center gap-3 rounded-lg text-sm font-semibold transition-all
                           border-2 border-gray-200 dark:border-gray-700 bg-white text-gray-700 
                           hover:bg-gray-50 hover:shadow-md
                           disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  renderLoadingSpinner()
                ) : (
                  <>
                    {/* SVG DE GOOGLE OPTIMIZADO */}
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continuar con Google
                  </>
                )}
              </button>
            </div>
          </div>

          {/* --- Panel Derecho --- */}
          <div className="col-span-1 lg:col-span-3 p-8 flex flex-col justify-center bg-background">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                {showForgotPassword
                  ? "Recuperar Contraseña"
                  : isSignUp
                    ? "Crear Cuenta"
                    : "Iniciar Sesión"}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {showForgotPassword
                  ? "Te enviaremos un enlace de recuperación"
                  : isSignUp
                    ? "Completa tus datos para comenzar"
                    : "Bienvenido de nuevo"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              {isSignUp && !showForgotPassword && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nombre
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) =>
                          handleInputChange("nombre", e.target.value)
                        }
                        className={inputClasses("nombre")}
                        placeholder="Juan"
                      />
                      {errors.nombre && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.nombre}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Apellido
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        value={formData.apellido}
                        onChange={(e) =>
                          handleInputChange("apellido", e.target.value)
                        }
                        className={inputClasses("apellido")}
                        placeholder="Pérez"
                      />
                      {errors.apellido && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.apellido}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <div className="relative mt-1">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={inputClasses("email")}
                    placeholder="tu@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              {!showForgotPassword && (
                <div>
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contraseña
                    </label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(true);
                          setErrors({});
                        }}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    )}
                  </div>
                  <div className="relative mt-1">
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className={inputClasses("password")}
                      placeholder="••••••••"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {isSignUp && !showForgotPassword && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirmar Contraseña
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      className={inputClasses("confirmPassword")}
                      placeholder="••••••••"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 inline-flex items-center justify-center rounded-lg text-sm font-semibold text-white 
                           bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg hover:from-blue-600 hover:to-indigo-700 
                           dark:from-blue-600 dark:to-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading
                  ? renderLoadingSpinner()
                  : showForgotPassword
                    ? "Enviar enlace"
                    : isSignUp
                      ? "Registrarse"
                      : "Iniciar Sesión"}
              </button>

              <div className="text-center pt-2">
                {showForgotPassword ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setErrors({});
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Volver a Iniciar Sesión
                  </button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {isSignUp ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setErrors({});
                        setFormData((prev) => ({
                          ...prev,
                          password: "",
                          confirmPassword: "",
                        }));
                      }}
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {isSignUp ? "Inicia Sesión" : "Regístrate"}
                    </button>
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
