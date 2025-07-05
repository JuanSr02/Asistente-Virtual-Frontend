"use client";

import { useState, useMemo } from "react";
import { supabase } from "@/supabaseClient";
import { CheckCircle, XCircle } from "lucide-react";

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Estado del formulario
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
      // Solo validar email en recuperación de contraseña
      return formData.email.trim() && !errors.email;
    } else if (isSignUp) {
      // Validar todos los campos en registro
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
      // Validar email y contraseña en login
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

    // Validar todos los campos antes de enviar
    const fieldsToValidate = Object.keys(formData) as Array<
      keyof typeof formData
    >;
    let hasErrors = false;

    for (const field of fieldsToValidate) {
      const isValid = validateField(field, formData[field]);
      if (!isValid) {
        hasErrors = true;
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
            data: {
              full_name: `${formData.nombre} ${formData.apellido}`,
            },
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
          setShowLogin(true);
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
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
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
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        alert(error.message);
      } else {
        setResetEmailSent(true);
        alert("¡Revisa tu email para resetear tu contraseña!");
        setShowForgotPassword(false);
        setShowLogin(true);
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div
        className={`w-full max-w-7xl mx-auto flex transition-all duration-300 ${
          showLogin || showForgotPassword || isSignUp
            ? "justify-start"
            : "justify-center"
        }`}
      >
        <div className="flex items-stretch">
          {/* Panel izquierdo */}
          <div className="bg-white p-10 rounded-l-2xl shadow-xl border border-gray-100 w-96 flex-shrink-0 flex flex-col justify-between min-h-[600px]">
            <div>
              <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-3">
                  Asistente Virtual
                </h1>
                <h2 className="text-2xl font-semibold text-indigo-800 mb-2">
                  Un soporte académico para estudiantes
                </h2>
                <div className="flex justify-center items-center gap-4 mt-4">
                  <span className="text-lg font-medium text-indigo-600">
                    UNSL
                  </span>
                  <span className="text-indigo-300">|</span>
                  <span className="text-lg font-medium text-indigo-600">
                    Dpto Informática
                  </span>
                </div>
              </div>
              <div className="flex justify-center gap-12 mb-10">
                <img
                  src="logoUNSL.png"
                  alt="Logo UNSL"
                  className="h-20 object-contain"
                />
                <img
                  src="logoDptoInfo.png"
                  alt="Logo Dpto Informática"
                  className="h-20 object-contain"
                />
              </div>
            </div>

            <div>
              {!showLogin && !showForgotPassword && (
                <button
                  onClick={() => setShowLogin(true)}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-lg font-semibold transition-all shadow-md hover:shadow-lg mb-8"
                >
                  Iniciar Sesión
                </button>
              )}
              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-3.5 bg-white hover:bg-gray-50 border-2 border-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 rounded-xl text-base font-semibold transition-colors flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
              >
                <img src="logoGoogle.png" alt="Google Logo" className="h-6" />
                Continuar con Google
              </button>
            </div>
          </div>

          {/* Panel recuperación contraseña */}
          {showForgotPassword && (
            <div className="bg-white p-10 rounded-r-2xl shadow-xl border-t border-r border-b border-gray-100 w-96 flex-shrink-0 min-h-[600px] flex flex-col justify-center -ml-px">
              <form
                onSubmit={handlePasswordReset}
                className="flex flex-col justify-between h-full"
              >
                <div>
                  <h1 className="text-center mb-10 text-[1.625rem] font-bold text-gray-800">
                    <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      Recuperar Contraseña
                    </span>
                  </h1>

                  <div className="mb-6">
                    <label
                      htmlFor="reset-email"
                      className="block mb-3 text-lg font-medium text-gray-700"
                    >
                      Email:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        required
                        placeholder="tu@email.com"
                        className={`w-full px-4 py-4 border-2 ${
                          errors.email
                            ? "border-red-500"
                            : formData.email.trim() && !errors.email
                              ? "border-green-500"
                              : "border-blue-200"
                        } bg-blue-50/30 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white transition-all`}
                      />
                      {formData.email.trim() && !errors.email && (
                        <CheckCircle className="absolute right-3 top-4 h-5 w-5 text-green-500" />
                      )}
                      {errors.email && (
                        <XCircle className="absolute right-3 top-4 h-5 w-5 text-red-500" />
                      )}
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={loading || !hasValidForm}
                    className={`w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl text-lg font-semibold transition-all shadow-md hover:shadow-lg mb-4 ${
                      !hasValidForm ? "opacity-70" : ""
                    }`}
                  >
                    {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                  </button>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setShowLogin(true);
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
                  <label
                    htmlFor="email"
                    className="block mb-3 text-lg font-medium text-gray-700"
                  >
                    Email:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      required
                      placeholder="tu@email.com"
                      className={`w-full px-4 py-4 border-2 ${
                        errors.email
                          ? "border-red-500"
                          : formData.email.trim() && !errors.email
                            ? "border-green-500"
                            : "border-blue-200"
                      } bg-blue-50/30 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white transition-all`}
                    />
                    {formData.email.trim() && !errors.email && (
                      <CheckCircle className="absolute right-3 top-4 h-5 w-5 text-green-500" />
                    )}
                    {errors.email && (
                      <XCircle className="absolute right-3 top-4 h-5 w-5 text-red-500" />
                    )}
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                <div className="mb-8">
                  <label
                    htmlFor="password"
                    className="block mb-3 text-lg font-medium text-gray-700"
                  >
                    Contraseña:
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      required
                      placeholder="Tu contraseña"
                      className={`w-full px-4 py-4 border-2 ${
                        errors.password
                          ? "border-red-500"
                          : formData.password.trim() && !errors.password
                            ? "border-green-500"
                            : "border-blue-200"
                      } bg-blue-50/30 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white transition-all`}
                    />
                    {formData.password.trim() && !errors.password && (
                      <CheckCircle className="absolute right-3 top-4 h-5 w-5 text-green-500" />
                    )}
                    {errors.password && (
                      <XCircle className="absolute right-3 top-4 h-5 w-5 text-red-500" />
                    )}
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
                <div className="text-right mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                      setShowLogin(false);
                    }}
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading || !hasValidForm}
                  className={`w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl text-lg font-semibold transition-all shadow-md hover:shadow-lg mb-4 ${
                    !hasValidForm ? "opacity-70" : ""
                  }`}
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
              <form
                onSubmit={handleEmailAuth}
                className="flex flex-col h-full justify-between"
              >
                <div>
                  <h2 className="text-center mb-10 text-3xl font-bold text-gray-800">
                    <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      Crear Cuenta
                    </span>
                  </h2>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="block mb-3 text-lg font-medium text-gray-700">
                        Email:
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          required
                          placeholder="tu@email.com"
                          className={`w-full px-4 py-4 border-2 ${
                            errors.email
                              ? "border-red-500"
                              : formData.email.trim() && !errors.email
                                ? "border-green-500"
                                : "border-blue-200"
                          } bg-blue-50/30 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white transition-all`}
                        />
                        {formData.email.trim() && !errors.email && (
                          <CheckCircle className="absolute right-3 top-4 h-5 w-5 text-green-500" />
                        )}
                        {errors.email && (
                          <XCircle className="absolute right-3 top-4 h-5 w-5 text-red-500" />
                        )}
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block mb-3 text-lg font-medium text-gray-700">
                        Nombre:
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.nombre}
                          onChange={(e) =>
                            handleInputChange("nombre", e.target.value)
                          }
                          required
                          className={`w-full px-4 py-4 border-2 ${
                            errors.nombre
                              ? "border-red-500"
                              : formData.nombre.trim() && !errors.nombre
                                ? "border-green-500"
                                : "border-green-200"
                          } bg-green-50/30 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 focus:bg-white transition-all`}
                        />
                        {formData.nombre.trim() && !errors.nombre && (
                          <CheckCircle className="absolute right-3 top-4 h-5 w-5 text-green-500" />
                        )}
                        {errors.nombre && (
                          <XCircle className="absolute right-3 top-4 h-5 w-5 text-red-500" />
                        )}
                      </div>
                      {errors.nombre && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.nombre}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block mb-3 text-lg font-medium text-gray-700">
                        Contraseña:
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          required
                          placeholder="Tu contraseña"
                          className={`w-full px-4 py-4 border-2 ${
                            errors.password
                              ? "border-red-500"
                              : formData.password.trim() && !errors.password
                                ? "border-green-500"
                                : "border-blue-200"
                          } bg-blue-50/30 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white transition-all`}
                        />
                        {formData.password.trim() && !errors.password && (
                          <CheckCircle className="absolute right-3 top-4 h-5 w-5 text-green-500" />
                        )}
                        {errors.password && (
                          <XCircle className="absolute right-3 top-4 h-5 w-5 text-red-500" />
                        )}
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.password}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block mb-3 text-lg font-medium text-gray-700">
                        Apellido:
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.apellido}
                          onChange={(e) =>
                            handleInputChange("apellido", e.target.value)
                          }
                          required
                          className={`w-full px-4 py-4 border-2 ${
                            errors.apellido
                              ? "border-red-500"
                              : formData.apellido.trim() && !errors.apellido
                                ? "border-green-500"
                                : "border-green-200"
                          } bg-green-50/30 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 focus:bg-white transition-all`}
                        />
                        {formData.apellido.trim() && !errors.apellido && (
                          <CheckCircle className="absolute right-3 top-4 h-5 w-5 text-green-500" />
                        )}
                        {errors.apellido && (
                          <XCircle className="absolute right-3 top-4 h-5 w-5 text-red-500" />
                        )}
                      </div>
                      {errors.apellido && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.apellido}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-10">
                  <button
                    type="submit"
                    disabled={loading || !hasValidForm}
                    className={`w-full py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl text-lg font-semibold transition-all shadow-md hover:shadow-lg mb-6 ${
                      !hasValidForm ? "opacity-70" : ""
                    }`}
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
  );
}
