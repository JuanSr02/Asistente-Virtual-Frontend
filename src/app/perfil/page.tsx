"use client"

import { useState, useEffect } from "react"
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
import { toast } from "@/hooks/use-toast"
import { Loader2, User, Mail, Phone, Trash2 } from "lucide-react"
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

  const [formData, setFormData] = useState({
    nombreApellido: "",
    mail: "",
    telefono: "",
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
        toast({
          title: "Error",
          description: "No se pudo cargar la información del usuario",
          variant: "destructive",
        })
        return
      }

      setUsuario(persona)
      setFormData({
        nombreApellido: persona.nombre_apellido,
        mail: persona.mail,
        telefono: persona.telefono || "",
      })
    } catch (error) {
      console.error("Error cargando datos del usuario:", error)
      toast({
        title: "Error",
        description: "Error al cargar los datos del usuario",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleActualizar = async () => {
    if (!usuario) return

    setUpdating(true)
    try {
      const datosActualizacion: ActualizarPerfilDTO = {}

      if (formData.nombreApellido !== usuario.nombre_apellido) {
        datosActualizacion.nombreApellido = formData.nombreApellido
      }

      if (formData.mail !== usuario.mail) {
        datosActualizacion.mail = formData.mail
      }

      if (formData.telefono !== (usuario.telefono || "")) {
        datosActualizacion.telefono = formData.telefono
      }

      if (Object.keys(datosActualizacion).length === 0) {
        toast({
          title: "Sin cambios",
          description: "No hay cambios para actualizar",
        })
        return
      }

      await perfilService.actualizarPerfil(usuario.id, datosActualizacion, usuario.rol_usuario)

      toast({
        title: "Perfil actualizado",
        description: "Los datos se han actualizado correctamente",
      })

      // Recargar datos
      await cargarDatosUsuario()
    } catch (error) {
      console.error("Error actualizando perfil:", error)
      toast({
        title: "Error",
        description: "Error al actualizar el perfil",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleEliminarCuenta = async () => {
    if (!usuario) return

    setDeleting(true)
    try {
      await perfilService.eliminarCuenta(usuario.id, usuario.rol_usuario)

      toast({
        title: "Cuenta eliminada",
        description: "Tu cuenta ha sido eliminada correctamente",
      })

      router.push("/auth")
    } catch (error) {
      console.error("Error eliminando cuenta:", error)
      toast({
        title: "Error",
        description: "Error al eliminar la cuenta",
        variant: "destructive",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="flex items-center justify-center gap-3 text-2xl">
              <User className="h-6 w-6 text-blue-600" />
              Mi Perfil
            </CardTitle>
            <CardDescription className="text-base">
              Gestiona tu información personal y configuración de cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Formulario en grid horizontal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nombreApellido" className="text-sm font-medium text-gray-700">
                  Nombre y Apellido
                </Label>
                <Input
                  id="nombreApellido"
                  value={formData.nombreApellido}
                  onChange={(e) => handleInputChange("nombreApellido", e.target.value)}
                  maxLength={50}
                  className="h-11 bg-white/70 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mail" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="mail"
                    type="email"
                    value={formData.mail}
                    onChange={(e) => handleInputChange("mail", e.target.value)}
                    className="h-11 pl-10 bg-white/70 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="telefono" className="text-sm font-medium text-gray-700">
                  Teléfono
                </Label>
                <div className="relative max-w-md">
                  <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange("telefono", e.target.value)}
                    className="h-11 pl-10 bg-white/70 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                    maxLength={15}
                    placeholder="Opcional"
                  />
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <Button
                onClick={handleActualizar}
                disabled={updating}
                className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium"
              >
                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Actualizar Perfil
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 h-11 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 bg-transparent"
                    disabled={deleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar Cuenta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará permanentemente tu cuenta y todos los datos
                      asociados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleEliminarCuenta}
                      className="bg-red-600 text-white hover:bg-red-700"
                      disabled={deleting}
                    >
                      {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Eliminar Cuenta
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
