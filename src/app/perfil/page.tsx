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
<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 flex items-center justify-center">
  <Card className="w-full max-w-md bg-white/95 shadow-md border border-gray-200 rounded-xl">
    <CardHeader className="text-center pb-4">
      <CardTitle className="flex items-center justify-center gap-2 text-lg font-semibold text-blue-700">
        <User className="h-5 w-5" />
        Mi Perfil
      </CardTitle>
      <CardDescription className="text-sm text-gray-600">
        Editá tus datos personales
      </CardDescription>
    </CardHeader>

    <CardContent className="space-y-4">
      {/* Campos en una sola columna */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="nombreApellido">Nombre y Apellido</Label>
          <Input
            id="nombreApellido"
            value={formData.nombreApellido}
            onChange={(e) => handleInputChange("nombreApellido", e.target.value)}
            maxLength={50}
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="mail">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              id="mail"
              type="email"
              value={formData.mail}
              onChange={(e) => handleInputChange("mail", e.target.value)}
              className="h-9 pl-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="telefono">Teléfono (opcional)</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) => handleInputChange("telefono", e.target.value)}
              className="h-9 pl-10"
              maxLength={15}
            />
          </div>
        </div>
      </div>
    </CardContent>

    <CardContent className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
      <Button
        onClick={handleActualizar}
        disabled={updating}
        className="flex-1 h-9 bg-blue-600 hover:bg-blue-700 text-white"
      >
        {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Guardar Cambios
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            className="flex-1 h-9 border-red-300 text-red-600 hover:bg-red-50"
            disabled={deleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar Cuenta
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
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
