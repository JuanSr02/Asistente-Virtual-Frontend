"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import {
  Loader2,
  User,
  Mail,
  Phone,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  KeyRound,
} from "lucide-react";
import { supabase } from "@/supabaseClient";
import personaService, { type Persona } from "@/services/personaService";
import perfilService from "@/services/perfilService";
import type { ActualizarPerfilDTO } from "@/types/perfil";

export default function PerfilPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    nombreApellido: "",
    mail: "",
    telefono: "",
    contrasenia: "",
  });

  const [errors, setErrors] = useState({
    nombreApellido: "",
    mail: "",
    telefono: "",
    contrasenia: "",
  });

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  const cargarDatosUsuario = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      const persona = await personaService.obtenerPersonaPorSupabaseId(user.id);
      if (!persona) {
        showToast({
          title: "Error",
          description: "No se pudo cargar la información del usuario",
          variant: "destructive",
        });
        return;
      }
      setUsuario(persona);
    } catch (error) {
      console.error("Error cargando datos del usuario:", error);
      showToast({
        title: "Error",
        description: "Error al cargar los datos del usuario",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const showToast = ({
    title,
    description,
    variant = "default",
    duration = 5000,
  }: {
    title: string;
    description: string;
    variant?: "default" | "destructive";
    duration?: number;
  }) => {
    toast({ title, description, variant, duration });
  };

  const validateField = (field: string, value: string) => {
    let error = "";
    switch (field) {
      case "nombreApellido":
        if (value.trim() && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = "El nombre y apellido solo puede contener letras y espacios";
        }
        break;
      case "mail":
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Ingresa un email válido";
        }
        break;
      case "telefono":
        if (value.trim() && !/^[\d\s\-\+\(\)]+$/.test(value)) {
          error =
            "El teléfono solo puede contener números, espacios y caracteres +, -, (, )";
        }
        break;
      case "contrasenia":
        if (value.trim() && value.length < 8) {
          error = "La contraseña debe tener al menos 8 caracteres";
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

  const hasValidChanges = useMemo(() => {
    const hasAnyChanges =
      formData.nombreApellido.trim() ||
      formData.mail.trim() ||
      formData.telefono.trim() ||
      formData.contrasenia.trim();
    if (!hasAnyChanges) return false;
    const allNonEmptyFieldsValid =
      (!formData.nombreApellido.trim() || !errors.nombreApellido) &&
      (!formData.mail.trim() || !errors.mail) &&
      (!formData.telefono.trim() || !errors.telefono) &&
      (!formData.contrasenia.trim() || !errors.contrasenia);
    return allNonEmptyFieldsValid;
  }, [formData, errors]);

  const handleActualizar = async () => {
    if (!usuario) return;
    const fieldsToValidate = Object.keys(formData) as Array<
      keyof typeof formData
    >;
    let hasErrors = false;
    for (const field of fieldsToValidate) {
      const isValid = validateField(field, formData[field]);
      if (!isValid) hasErrors = true;
    }
    if (hasErrors) {
      showToast({
        title: "❌ Error de validación",
        description: "Por favor corrige los errores antes de continuar",
        variant: "destructive",
      });
      return;
    }
    setUpdating(true);
    try {
      const datosActualizacion: ActualizarPerfilDTO = {};
      if (formData.nombreApellido.trim())
        datosActualizacion.nombreApellido = formData.nombreApellido.trim();
      if (formData.mail.trim()) datosActualizacion.mail = formData.mail.trim();
      if (formData.telefono.trim())
        datosActualizacion.telefono = formData.telefono.trim();
      if (formData.contrasenia.trim())
        datosActualizacion.contrasenia = formData.contrasenia;
      if (Object.keys(datosActualizacion).length === 0) {
        showToast({
          title: "ℹ️ Sin cambios",
          description: "No hay cambios para actualizar",
        });
        return;
      }
      await perfilService.actualizarPerfil(
        usuario.id,
        datosActualizacion,
        usuario.rol_usuario
      );
      const camposActualizados = [];
      if (datosActualizacion.nombreApellido)
        camposActualizados.push("nombre y apellido");
      if (datosActualizacion.mail) camposActualizados.push("email");
      if (datosActualizacion.telefono) camposActualizados.push("teléfono");
      if (datosActualizacion.contrasenia) camposActualizados.push("contraseña");
      showToast({
        title: "✅ Datos actualizados",
        description: `Se actualizó: ${camposActualizados.join(", ")}`,
        duration: 5000,
      });
      setFormData({
        nombreApellido: "",
        mail: "",
        telefono: "",
        contrasenia: "",
      });
      await cargarDatosUsuario();
      if (datosActualizacion.contrasenia) {
        showToast({
          title: "🔐 Contraseña actualizada",
          description:
            "Deberás volver a iniciar sesión con tu nueva contraseña",
          duration: 7000,
        });
      }
    } catch (error: any) {
      console.error("Error actualizando perfil:", error);
      if (error?.status === 500 && error?.message?.includes("Unexpected")) {
        showToast({
          title: "❌ Error al actualizar",
          description: "Ya existe una cuenta con ese correo. Usa otro email.",
          variant: "destructive",
          duration: 6000,
        });
      } else {
        const errorMessage =
          error?.message || "Error desconocido al actualizar el perfil";
        showToast({
          title: "❌ Error al actualizar",
          description: errorMessage,
          variant: "destructive",
          duration: 6000,
        });
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleEliminarCuenta = async () => {
    if (!usuario) return;
    setDeleting(true);
    try {
      await perfilService.eliminarCuenta(usuario.id, usuario.rol_usuario);
      showToast({
        title: "✅ Cuenta eliminada",
        description: "Tu cuenta ha sido eliminada correctamente",
      });
      router.push("/auth");
    } catch (error: any) {
      console.error("Error eliminando cuenta:", error);
      const errorMessage =
        error?.message ||
        error?.error ||
        "Error desconocido al eliminar la cuenta";
      showToast({
        title: "❌ Error al eliminar cuenta",
        description: errorMessage,
        variant: "destructive",
        duration: 6000,
      });
      setDeleting(false);
    }
  };

  const inputClasses = (
    hasError: boolean,
    hasContent: boolean,
    hasIcon: boolean = false
  ) =>
    `h-10 border-blue-300 dark:border-blue-800 focus-visible:ring-2 focus-visible:ring-blue-400 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-0 bg-background
     ${hasIcon ? "pl-10" : ""} pr-10
     ${hasError ? "border-red-500 dark:border-red-700 focus-visible:ring-red-400 dark:focus-visible:ring-red-500" : ""}
     ${!hasError && hasContent ? "border-green-500 dark:border-green-700 focus-visible:ring-green-400 dark:focus-visible:ring-green-500" : ""}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }
  if (!usuario) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 dark:text-red-400">
          No se pudo cargar la información del usuario.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 dark:bg-background p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl mx-auto bg-background shadow-lg border border-border rounded-xl">
        <CardHeader className="p-6 border-b border-border">
          <CardTitle className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Mi Perfil
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            Actualiza tus datos personales y de acceso.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Nombre y Apellido */}
          <div className="space-y-2">
            <Label
              htmlFor="nombreApellido"
              className="font-semibold text-foreground"
            >
              Nombre y Apellido
            </Label>
            <div className="text-sm text-foreground bg-muted px-4 py-2.5 rounded-md border border-border">
              {usuario.nombre_apellido}
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="nombreApellido"
                placeholder="Ingresa tu nuevo nombre y apellido"
                value={formData.nombreApellido}
                onChange={(e) =>
                  handleInputChange("nombreApellido", e.target.value)
                }
                maxLength={50}
                className={inputClasses(
                  !!errors.nombreApellido,
                  !!formData.nombreApellido,
                  true
                )}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4">
                {errors.nombreApellido ? (
                  <XCircle className="text-red-500 dark:text-red-400" />
                ) : (
                  formData.nombreApellido && (
                    <CheckCircle className="text-green-500 dark:text-green-400" />
                  )
                )}
              </div>
            </div>
            {errors.nombreApellido && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                {errors.nombreApellido}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="mail" className="font-semibold text-foreground">
              Email
            </Label>
            <div className="text-sm text-foreground bg-muted px-4 py-2.5 rounded-md border border-border flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {usuario.mail}
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="mail"
                type="email"
                placeholder="Ingresa tu nuevo email"
                value={formData.mail}
                onChange={(e) => handleInputChange("mail", e.target.value)}
                className={inputClasses(!!errors.mail, !!formData.mail, true)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4">
                {errors.mail ? (
                  <XCircle className="text-red-500 dark:text-red-400" />
                ) : (
                  formData.mail && (
                    <CheckCircle className="text-green-500 dark:text-green-400" />
                  )
                )}
              </div>
            </div>
            {errors.mail && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                {errors.mail}
              </p>
            )}
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="telefono" className="font-semibold text-foreground">
              Teléfono (Opcional)
            </Label>
            <div className="text-sm text-foreground bg-muted px-4 py-2.5 rounded-md border border-border flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />{" "}
              {usuario.telefono || "No especificado"}
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="telefono"
                placeholder="Ingresa tu nuevo teléfono"
                value={formData.telefono}
                onChange={(e) => handleInputChange("telefono", e.target.value)}
                maxLength={15}
                className={inputClasses(
                  !!errors.telefono,
                  !!formData.telefono,
                  true
                )}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4">
                {errors.telefono ? (
                  <XCircle className="text-red-500 dark:text-red-400" />
                ) : (
                  formData.telefono && (
                    <CheckCircle className="text-green-500 dark:text-green-400" />
                  )
                )}
              </div>
            </div>
            {errors.telefono && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                {errors.telefono}
              </p>
            )}
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <Label
              htmlFor="contrasenia"
              className="font-semibold text-foreground"
            >
              Nueva Contraseña
            </Label>
            <p className="text-xs text-muted-foreground">
              Si la cambias, deberás volver a iniciar sesión.
            </p>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="contrasenia"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={formData.contrasenia}
                onChange={(e) =>
                  handleInputChange("contrasenia", e.target.value)
                }
                className={inputClasses(
                  !!errors.contrasenia,
                  !!formData.contrasenia,
                  true
                )}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
                {errors.contrasenia ? (
                  <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
                ) : (
                  formData.contrasenia && (
                    <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                  )
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {errors.contrasenia && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                {errors.contrasenia}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-6 bg-muted/50 border-t border-border flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleActualizar}
            disabled={updating || !hasValidChanges}
            className="w-full sm:w-auto flex-1 h-10 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-muted-foreground"
          >
            {updating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Guardar Cambios
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto flex-1 h-10 border-red-500 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300"
                disabled={deleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Cuenta
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-700 dark:text-red-400">
                  ¿Estás absolutamente seguro?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente
                  tu cuenta y todos tus datos asociados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleEliminarCuenta}
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
                  disabled={deleting}
                >
                  {deleting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sí, eliminar mi cuenta
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
