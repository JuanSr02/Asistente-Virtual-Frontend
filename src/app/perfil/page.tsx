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
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Mi Perfil
          </CardTitle>
          <CardDescription>Gestiona tu información personal y configuración de cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombreApellido">Nombre y Apellido</Label>
              <Input
                id="nombreApellido"
                value={formData.nombreApellido}
                onChange={(e) => handleInputChange("nombreApellido", e.target.value)}
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mail">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="mail"
                  type="email"
                  value={formData.mail}
                  onChange={(e) => handleInputChange("mail", e.target.value)}
                  className="pl-10"
                  maxLength={50}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange("telefono", e.target.value)}
                  className="pl-10"
                  maxLength={15}
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Rol:</strong> {usuario.rol_usuario}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-6 border-t">
            <Button onClick={handleActualizar} disabled={updating} className="w-full">
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Actualizar Perfil
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" disabled={deleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar Cuenta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
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
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
  )
}
