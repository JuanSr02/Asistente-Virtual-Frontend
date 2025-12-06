"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/supabaseClient";
import { usePersona } from "@/hooks/domain/usePersona";
import { usePerfil } from "@/hooks/domain/usePerfil";
import { useConfirm } from "@/components/providers/confirm-dialog-provider";
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
  Save,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ActualizarPerfilDTO } from "@/lib/types/perfil";
import { profileSchema } from "@/lib/schemas/profile"; // NUEVO IMPORT

export default function PerfilPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, []);

  const { data: persona, isLoading: isLoadingPersona } = usePersona(
    currentUser?.id,
    currentUser?.email
  );

  const { actualizarPerfil, isUpdating, eliminarCuenta, isDeleting } =
    usePerfil(
      persona?.id?.toString() || "0",
      persona?.rol_usuario || "ESTUDIANTE"
    );

  const { confirm } = useConfirm();

  // Estado del Formulario
  const [formData, setFormData] = useState({
    nombreApellido: "",
    mail: "",
    telefono: "",
    contrasenia: "",
  });

  // Estado de Errores (Zod)
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sincronizar (Solo resetear campos editables, dejamos vacíos para placeholder)
  useEffect(() => {
    if (persona) {
      setFormData({
        nombreApellido: "",
        mail: "",
        telefono: "",
        contrasenia: "",
      });
      setErrors({});
    }
  }, [persona]);

  // Manejo de Cambios con Validación Zod en tiempo real
  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);

    // Validar solo el campo que cambió
    const result = profileSchema.safeParse(newData);
    if (!result.success) {
      const fieldError = result.error.issues.find((e) => e.path[0] === field);
      setErrors((prev) => ({
        ...prev,
        [field]: fieldError ? fieldError.message : "",
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const hasValidChanges = useMemo(() => {
    const hasAnyContent = Object.values(formData).some(
      (val) => val.trim() !== ""
    );
    if (!hasAnyContent) return false;

    // Verificar si hay errores en el estado o si Zod falla globalmente
    const result = profileSchema.safeParse(formData);
    return result.success;
  }, [formData]);

  const handleActualizar = async () => {
    if (!persona) return;

    // Validación final antes de enviar
    const result = profileSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) newErrors[err.path[0].toString()] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    // Construir DTO solo con campos llenos
    const datosActualizacion: ActualizarPerfilDTO = {};
    if (formData.nombreApellido.trim())
      datosActualizacion.nombreApellido = formData.nombreApellido.trim();
    if (formData.mail.trim()) datosActualizacion.mail = formData.mail.trim();
    if (formData.telefono.trim())
      datosActualizacion.telefono = formData.telefono.trim();
    if (formData.contrasenia.trim())
      datosActualizacion.contrasenia = formData.contrasenia;

    try {
      await actualizarPerfil(datosActualizacion);
      // Limpiar tras éxito
      setFormData({
        nombreApellido: "",
        mail: "",
        telefono: "",
        contrasenia: "",
      });
    } catch (e) {
      // Error manejado en hook
    }
  };

  const handleEliminar = async () => {
    const ok = await confirm({
      title: "¿Estás absolutamente seguro?",
      description:
        "Esta acción no se puede deshacer. Se eliminará permanentemente tu cuenta y todos tus datos asociados.",
      confirmText: "Sí, eliminar mi cuenta",
      variant: "destructive",
    });

    if (ok) {
      eliminarCuenta();
    }
  };

  const inputClasses = (fieldName: string) => {
    const hasError = !!errors[fieldName];
    // @ts-ignore
    const hasContent = !!formData[fieldName];

    return `h-10 border-input bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 pr-10 pl-10
     ${hasError ? "border-red-500 focus-visible:ring-red-500" : ""}
     ${!hasError && hasContent ? "border-green-500 focus-visible:ring-green-500" : ""}`;
  };

  if (!currentUser || isLoadingPersona) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!persona) {
    return <div className="text-center py-20">Error al cargar perfil.</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30 dark:bg-background p-4 sm:p-6 lg:p-8 animate-in fade-in">
      <Card className="w-full max-w-2xl mx-auto bg-card shadow-lg border border-border rounded-xl">
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
            <Label htmlFor="nombreApellido" className="font-semibold">
              Nombre y Apellido
            </Label>
            <div className="text-sm text-muted-foreground bg-muted px-4 py-2.5 rounded-md border border-border">
              {persona.nombre_apellido}
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="nombreApellido"
                placeholder="Ingresa nuevo nombre..."
                value={formData.nombreApellido}
                onChange={(e) =>
                  handleInputChange("nombreApellido", e.target.value)
                }
                className={inputClasses("nombreApellido")}
              />
              <StatusIcon
                hasError={!!errors.nombreApellido}
                hasContent={!!formData.nombreApellido}
              />
            </div>
            {errors.nombreApellido && (
              <ErrorMessage message={errors.nombreApellido} />
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="mail" className="font-semibold">
              Email
            </Label>
            <div className="text-sm text-muted-foreground bg-muted px-4 py-2.5 rounded-md border border-border flex items-center gap-2">
              <Mail className="h-4 w-4" /> {persona.mail}
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="mail"
                type="email"
                placeholder="Ingresa nuevo email..."
                value={formData.mail}
                onChange={(e) => handleInputChange("mail", e.target.value)}
                className={inputClasses("mail")}
              />
              <StatusIcon
                hasError={!!errors.mail}
                hasContent={!!formData.mail}
              />
            </div>
            {errors.mail && <ErrorMessage message={errors.mail} />}
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="telefono" className="font-semibold">
              Teléfono{" "}
              <span className="text-muted-foreground font-normal">
                (Opcional)
              </span>
            </Label>
            <div className="text-sm text-muted-foreground bg-muted px-4 py-2.5 rounded-md border border-border flex items-center gap-2">
              <Phone className="h-4 w-4" />{" "}
              {usuarioConFormato(persona.telefono) || "No especificado"}
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="telefono"
                placeholder="Ej: +54 9 266 4..."
                value={formData.telefono}
                onChange={(e) => handleInputChange("telefono", e.target.value)}
                className={inputClasses("telefono")}
              />
              <StatusIcon
                hasError={!!errors.telefono}
                hasContent={!!formData.telefono}
              />
            </div>
            {errors.telefono && <ErrorMessage message={errors.telefono} />}
          </div>

          {/* Contraseña */}
          <div className="space-y-2 pt-4 border-t border-dashed">
            <Label htmlFor="contrasenia" className="font-semibold">
              Nueva Contraseña
            </Label>
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
                className={inputClasses("contrasenia")}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
                <StatusIcon
                  hasError={!!errors.contrasenia}
                  hasContent={!!formData.contrasenia}
                  noIcon // Para no chocar con el ojo
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground mr-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Aviso importante */}
            <p className="text-xs text-muted-foreground mt-2 flex items-start gap-2 bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded border border-yellow-200 dark:border-yellow-900/30 text-yellow-800 dark:text-yellow-500">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              Si cambias tu contraseña, deberás volver a iniciar sesión en todos
              tus dispositivos.
            </p>

            {errors.contrasenia && (
              <ErrorMessage message={errors.contrasenia} />
            )}
          </div>
        </CardContent>

        <CardFooter className="p-6 bg-muted/30 border-t border-border flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleActualizar}
            disabled={isUpdating || !hasValidChanges}
            className="w-full sm:w-auto flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isUpdating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar Cambios
          </Button>

          <Button
            variant="outline"
            onClick={handleEliminar}
            disabled={isDeleting}
            className="w-full sm:w-auto flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/50"
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Eliminar Cuenta
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Helpers visuales
const usuarioConFormato = (tel: string | undefined) => tel; // Placeholder si quisieras formatear

const StatusIcon = ({
  hasError,
  hasContent,
  noIcon = false,
}: {
  hasError: boolean;
  hasContent: boolean;
  noIcon?: boolean;
}) => {
  if (noIcon) return null;
  if (hasError)
    return (
      <XCircle className="h-4 w-4 text-red-500 absolute right-3 top-1/2 -translate-y-1/2" />
    );
  if (hasContent)
    return (
      <CheckCircle className="h-4 w-4 text-green-500 absolute right-3 top-1/2 -translate-y-1/2" />
    );
  return null;
};

const ErrorMessage = ({ message }: { message: string }) => (
  <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1 ml-1">
    {message}
  </p>
);
