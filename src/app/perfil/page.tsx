"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { Loader2, User, Mail, Phone, Trash2, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"
import { supabase } from "@/supabaseClient"
import personaService, { type Persona } from "@/services/personaService"
import perfilService from "@/services/perfilService"
import type { ActualizarPerfilDTO } from "@/types/perfil"

export default function PerfilPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<Persona | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombreApellido: "",
    mail: "",
    telefono: "",
    contrasenia: "",
  })

  const [errors, setErrors] = useState({
    nombreApellido: "",
    mail: "",
    telefono: "",
    contrasenia: "",
  })

  useEffect(() => {
    cargarDatosUsuario()
  }, [])

  const cargarDatosUsuario = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth")
        return
      }

      const persona = await personaService.obtenerPersonaPorSupabaseId(user.id)

      if (!persona) {
        showToast({
          title: "Error",
          description: "No se pudo cargar la información del usuario",
          variant: "destructive",
        })
        return
      }

      setUsuario(persona)
    } catch (error) {
      console.error("Error cargando datos del usuario:", error)
      showToast({
        title: "Error",
        description: "Error al cargar los datos del usuario",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const showToast = ({
    title,
    description,
    variant = "default",
    duration = 5000
  }: {
    title: string;
    description: string;
    variant?: "default" | "destructive";
    duration?: number;
  }) => {
    toast({
      title,
      description,
      variant,
      duration,
    })
  }

  const validateField = (field: string, value: string) => {
    let error = ""
    
    switch (field) {
      case "nombreApellido":
        if (value.trim() && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = "El nombre y apellido solo puede contener letras y espacios"
        }
        break
      case "mail":
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Ingresa un email válido"
        }
        break
      case "telefono":
        if (value.trim() && !/^[\d\s\-\+\(\)]+$/.test(value)) {
          error = "El teléfono solo puede contener números, espacios y caracteres +, -, (, )"
        }
        break
      case "contrasenia":
        if (value.trim() && value.length < 8) {
          error = "La contraseña debe tener al menos 8 caracteres"
        }
        break
    }
    
    setErrors(prev => ({ ...prev, [field]: error }))
    return error === ""
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    validateField(field, value)
  }

  const hasValidChanges = useMemo(() => {
    // Verificar si hay al menos un campo no vacío
    const hasAnyChanges = 
      formData.nombreApellido.trim() || 
      formData.mail.trim() || 
      formData.telefono.trim() || 
      formData.contrasenia.trim()

    if (!hasAnyChanges) return false

    // Verificar que todos los campos no vacíos sean válidos
    const allNonEmptyFieldsValid = 
      (!formData.nombreApellido.trim() || !errors.nombreApellido) &&
      (!formData.mail.trim() || !errors.mail) &&
      (!formData.telefono.trim() || !errors.telefono) &&
      (!formData.contrasenia.trim() || !errors.contrasenia)

    return allNonEmptyFieldsValid
  }, [formData, errors])

  const handleActualizar = async () => {
    if (!usuario) return

    // Validar todos los campos antes de enviar
    const fieldsToValidate = Object.keys(formData) as Array<keyof typeof formData>
    let hasErrors = false

    for (const field of fieldsToValidate) {
      const isValid = validateField(field, formData[field])
      if (!isValid) {
        hasErrors = true
      }
    }

    if (hasErrors) {
      showToast({
        title: "❌ Error de validación",
        description: "Por favor corrige los errores antes de continuar",
        variant: "destructive",
      })
      return
    }

    setUpdating(true)
    try {
      const datosActualizacion: ActualizarPerfilDTO = {}

      if (formData.nombreApellido.trim()) {
        datosActualizacion.nombreApellido = formData.nombreApellido.trim()
      }

      if (formData.mail.trim()) {
        datosActualizacion.mail = formData.mail.trim()
      }

      if (formData.telefono.trim()) {
        datosActualizacion.telefono = formData.telefono.trim()
      }

      if (formData.contrasenia.trim()) {
        datosActualizacion.contrasenia = formData.contrasenia
      }

      if (Object.keys(datosActualizacion).length === 0) {
        showToast({
          title: "ℹ️ Sin cambios",
          description: "No hay cambios para actualizar",
        })
        return
      }

      await perfilService.actualizarPerfil(usuario.id, datosActualizacion, usuario.rol_usuario)

      // Mostrar alerta de éxito con detalles
      const camposActualizados = []
      if (datosActualizacion.nombreApellido) camposActualizados.push("nombre y apellido")
      if (datosActualizacion.mail) camposActualizados.push("email")
      if (datosActualizacion.telefono) camposActualizados.push("teléfono")
      if (datosActualizacion.contrasenia) camposActualizados.push("contraseña")

      showToast({
        title: "✅ Datos actualizados correctamente",
        description: `Se actualizó: ${camposActualizados.join(", ")}`,
        duration: 5000,
      })

      // Limpiar formulario después de actualizar
      setFormData({
        nombreApellido: "",
        mail: "",
        telefono: "",
        contrasenia: "",
      })

      // Recargar datos
      await cargarDatosUsuario()

      // Si se cambió la contraseña, mostrar alerta adicional
      if (datosActualizacion.contrasenia) {
        showToast({
          title: "🔐 Contraseña actualizada",
          description: "Deberás volver a iniciar sesión con tu nueva contraseña",
          duration: 7000,
        })
      }

    } catch (error: any) {
      console.error("Error actualizando perfil:", error)
      
      if (error?.status === 500 && error?.message?.includes("Unexpected")) {
        showToast({
          title: "❌ Error al actualizar",
          description: "Ya existe una cuenta con ese correo electrónico. Por favor, utiliza otro email.",
          variant: "destructive",
          duration: 6000,
        })
      } else {
        const errorMessage = error?.message || "Error desconocido al actualizar el perfil"
        
        showToast({
          title: "❌ Error al actualizar",
          description: errorMessage,
          variant: "destructive",
          duration: 6000,
        })
      }
    } finally {
      setUpdating(false)
    }
  }

  const handleEliminarCuenta = async () => {
    if (!usuario) return

    setDeleting(true)
    try {
      await perfilService.eliminarCuenta(usuario.id, usuario.rol_usuario)

      showToast({
        title: "✅ Cuenta eliminada",
        description: "Tu cuenta ha sido eliminada correctamente",
      })

      router.push("/auth")
    } catch (error: any) {
      console.error("Error eliminando cuenta:", error)
      
      const errorMessage = error?.message || error?.error || "Error desconocido al eliminar la cuenta"
      
      showToast({
        title: "❌ Error al eliminar cuenta",
        description: errorMessage,
        variant: "destructive",
        duration: 6000,
      })
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>No se pudo cargar la información del usuario</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white px-4 pt-10 pb-20">
      <Card className="w-full max-w-3xl mx-auto bg-white shadow-lg border border-blue-200 rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-blue-100">
          <CardTitle className="text-xl sm:text-2xl font-bold text-blue-800 flex items-center gap-2">
            <User className="w-6 h-6" />
            Mi Perfil
          </CardTitle>
          <CardDescription className="text-sm text-blue-600 mt-1">
            Editá tus datos personales
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-6 space-y-6">
          {/* Nombre y Apellido */}
          <div className="space-y-3">
            <Label htmlFor="nombreApellidoActual" className="text-blue-900 font-medium">
              Nombre y Apellido
            </Label>
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md border">
              {usuario.nombre_apellido}
            </div>
            <div className="relative">
              <Input
                id="nombreApellido"
                placeholder="Ingresa tu nuevo nombre y apellido"
                value={formData.nombreApellido}
                onChange={(e) => handleInputChange("nombreApellido", e.target.value)}
                maxLength={50}
                className={`h-10 border-blue-300 focus:ring-2 focus:ring-blue-400 ${
                  errors.nombreApellido ? "border-red-500" : 
                  formData.nombreApellido.trim() && !errors.nombreApellido ? "border-green-500" : ""
                }`}
              />
              {formData.nombreApellido.trim() && !errors.nombreApellido && (
                <CheckCircle className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
              )}
              {errors.nombreApellido && (
                <XCircle className="absolute right-3 top-2.5 h-4 w-4 text-red-500" />
              )}
            </div>
            {errors.nombreApellido && (
              <p className="text-red-500 text-sm">{errors.nombreApellido}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-3">
            <Label htmlFor="mailActual" className="text-blue-900 font-medium">
              Email
            </Label>
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md border flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-400" />
              {usuario.mail}
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-blue-400" />
              <Input
                id="mail"
                type="email"
                placeholder="Ingresa tu nuevo email"
                value={formData.mail}
                onChange={(e) => handleInputChange("mail", e.target.value)}
                className={`h-10 pl-10 pr-10 border-blue-300 focus:ring-2 focus:ring-blue-400 ${
                  errors.mail ? "border-red-500" : 
                  formData.mail.trim() && !errors.mail ? "border-green-500" : ""
                }`}
              />
              {formData.mail.trim() && !errors.mail && (
                <CheckCircle className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
              )}
              {errors.mail && (
                <XCircle className="absolute right-3 top-2.5 h-4 w-4 text-red-500" />
              )}
            </div>
            {errors.mail && (
              <p className="text-red-500 text-sm">{errors.mail}</p>
            )}
          </div>

          {/* Teléfono */}
          <div className="space-y-3">
            <Label htmlFor="telefonoActual" className="text-blue-900 font-medium">
              Teléfono
            </Label>
            <p className="text-xs text-gray-500">
              Opcional, es para que te contacten
            </p>
            {usuario.telefono && (
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md border flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-400" />
                {usuario.telefono}
              </div>
            )}
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-blue-400" />
              <Input
                id="telefono"
                placeholder="Ingresa tu nuevo teléfono"
                value={formData.telefono}
                onChange={(e) => handleInputChange("telefono", e.target.value)}
                className={`h-10 pl-10 pr-10 border-blue-300 focus:ring-2 focus:ring-blue-400 ${
                  errors.telefono ? "border-red-500" : 
                  formData.telefono.trim() && !errors.telefono ? "border-green-500" : ""
                }`}
                maxLength={15}
              />
              {formData.telefono.trim() && !errors.telefono && (
                <CheckCircle className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
              )}
              {errors.telefono && (
                <XCircle className="absolute right-3 top-2.5 h-4 w-4 text-red-500" />
              )}
            </div>
            {errors.telefono && (
              <p className="text-red-500 text-sm">{errors.telefono}</p>
            )}
          </div>

          {/* Contraseña */}
          <div className="space-y-3">
            <Label htmlFor="contrasenia" className="text-blue-900 font-medium">
              Nueva Contraseña (Tendras que volver a iniciar sesion si cambias la contraseña)
            </Label>
            <div className="relative">
              <Input
                id="contrasenia"
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu nueva contraseña (mínimo 8 caracteres)"
                value={formData.contrasenia}
                onChange={(e) => handleInputChange("contrasenia", e.target.value)}
                className={`h-10 pr-20 border-blue-300 focus:ring-2 focus:ring-blue-400 ${
                  errors.contrasenia ? "border-red-500" : 
                  formData.contrasenia.trim() && !errors.contrasenia ? "border-green-500" : ""
                }`}
              />
              <div className="absolute right-3 top-2.5 flex items-center gap-2">
                {formData.contrasenia.trim() && !errors.contrasenia && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {errors.contrasenia && (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="h-4 w-4 text-blue-400 hover:text-blue-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {errors.contrasenia && (
              <p className="text-red-500 text-sm">{errors.contrasenia}</p>
            )}
          </div>
        </CardContent>

        <CardContent className="px-6 pt-2 pb-6 border-t border-blue-100 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleActualizar}
            disabled={updating || !hasValidChanges}
            className={`flex-1 h-10 ${
              hasValidChanges 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {hasValidChanges ? "Guardar Cambios" : "Sin cambios válidos"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 h-10 border-red-300 text-red-600 hover:bg-red-50"
                disabled={deleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Cuenta
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-700">¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará tu cuenta y no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleEliminarCuenta}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={deleting}
                >
                  {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sí, eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}