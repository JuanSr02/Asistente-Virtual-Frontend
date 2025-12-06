"use client";

import { useState } from "react";
import { type User } from "@supabase/supabase-js";
import { usePersona } from "@/hooks/domain/usePersona";
import { useHistoriaAcademica } from "@/hooks/domain/useHistoriaAcademica";
import { useExperiencias } from "@/hooks/domain/useExperiencias";
import { useQuery } from "@tanstack/react-query";
import planesEstudioService from "@/services/planesEstudioService";
import { useModal } from "@/stores/modal-store";
import { useConfirm } from "@/components/providers/confirm-dialog-provider";
import Modal from "@/components/modals/Modal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquareQuote,
  FileSearch,
  PenSquare,
  GraduationCap,
  BookOpenCheck,
  Edit,
  Trash2,
  Book,
  Link as LinkIcon,
  Clock,
  Hash,
  Target,
  BarChart3,
  CalendarDays,
  Contact,
  ExternalLink,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { sharedKeys } from "@/lib/query-keys";

// --- DATOS ESTÁTICOS ---
const RECURSOS_DISPONIBLES = [
  "Libros",
  "Diapositivas",
  "Resumen Propio",
  "Resumen de Terceros",
  "Videos/YouTube",
  "Clases de Consulta",
  "Modelos de Examen",
];

const MOTIVACIONES_DISPONIBLES = [
  "Me gusta la materia",
  "Es correlativa importante",
  "Se me vencía la regularidad",
  "Para avanzar en la carrera",
  "Materia fácil / Promedio",
];

const INITIAL_FORM_STATE = {
  examenId: "",
  dificultad: 5,
  diasEstudio: 7,
  horasDiarias: 4,
  intentosPrevios: 0,
  modalidad: "ESCRITO",
  recursos: [] as string[],
  motivacion: "Para avanzar en la carrera",
  linkResumen: "",
};

export default function ExperienciasExamen({ user }: { user: User }) {
  // 1. Estados de Filtros
  const [planSeleccionado, setPlanSeleccionado] = useState("");
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [filtroCalificacion, setFiltroCalificacion] = useState("");
  const [filtroTiempo, setFiltroTiempo] = useState("all");

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  // 2. Hooks Globales
  const {
    openModal,
    closeModal,
    isOpen: isModalOpen,
    data: modalData,
  } = useModal("experiencia-modal");
  const { confirm } = useConfirm();

  // 3. Hooks de Dominio
  const { data: persona } = usePersona(user.id, user.email);
  const { historia, planes } = useHistoriaAcademica(persona?.id);

  const {
    misExperiencias,
    experienciasMateria,
    examenesDisponibles,
    crear,
    actualizar,
    eliminar,
    isLoadingMisExperiencias,
    isLoadingExperienciasMateria,
  } = useExperiencias(persona?.id?.toString() || "0", materiaSeleccionada);

  const { data: materias } = useQuery({
    queryKey: sharedKeys.materiasPorPlan(planSeleccionado),
    queryFn: () =>
      planesEstudioService.obtenerMateriasPorPlan(planSeleccionado),
    enabled: !!planSeleccionado,
  });

  // Lógica de Filtrado
  const experienciasFiltradas = experienciasMateria.filter((exp: any) => {
    if (filtroCalificacion && exp.nota < parseInt(filtroCalificacion))
      return false;
    if (filtroTiempo !== "all") {
      const [dia, mes, anio] = exp.fechaExamen.split("-");
      const fecha = new Date(`${anio}-${mes}-${dia}`);
      const hoy = new Date();
      const diffYears =
        (hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (filtroTiempo === "1year" && diffYears > 1) return false;
      if (filtroTiempo === "2years" && diffYears > 2) return false;
      if (filtroTiempo === "5years" && diffYears > 5) return false;
    }
    return true;
  });

  // Handlers
  const handleOpenCrear = () => {
    setFormData(INITIAL_FORM_STATE);
    openModal(null, "crear");
  };

  const handleOpenEditar = (exp: any) => {
    setFormData({
      examenId: exp.id.toString(),
      dificultad: exp.dificultad,
      diasEstudio: exp.diasEstudio,
      horasDiarias: exp.horasDiarias,
      intentosPrevios: exp.intentosPrevios,
      modalidad: exp.modalidad,
      recursos: exp.recursos ? exp.recursos.split(", ") : [],
      motivacion: exp.motivacion,
      linkResumen: exp.linkResumen || "",
    });
    openModal(exp, "editar");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dto = {
      ...formData,
      recursos: formData.recursos.join(", "),
      examenId: parseInt(formData.examenId),
    };

    try {
      if (modalData) {
        await actualizar({ id: modalData.id, data: dto });
      } else {
        await crear(dto);
      }
      closeModal();
    } catch (e) {}
  };

  const handleDelete = async (id: number) => {
    if (
      await confirm({
        title: "¿Eliminar Experiencia?",
        description: "Esta acción no se puede deshacer.",
        variant: "destructive",
      })
    ) {
      eliminar(id);
    }
  };

  const showResumenInput =
    formData.recursos.includes("Resumen Propio") ||
    formData.recursos.includes("Resumen de Terceros");

  if (!persona) return <Skeleton className="h-96 w-full rounded-xl" />;

  if (!historia) {
    return (
      <Card className="text-center py-12 mt-8 border-dashed">
        <CardContent className="flex flex-col items-center gap-4">
          <GraduationCap className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-xl font-semibold">Carga tu Historia Académica</h3>
          <p className="text-muted-foreground">
            Necesitas cargar tu historia para ver y compartir experiencias.
          </p>
          <Button
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("changeTab", { detail: "recomendacion" })
              )
            }
          >
            Ir a Sugerencias
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-purple-950/40 dark:via-background dark:to-pink-950/40 border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-foreground">
            <MessageSquareQuote className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Experiencias de Examen
          </CardTitle>
          <CardDescription>
            Comparte y descubre experiencias para preparar mejor tus finales.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Buscador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileSearch className="h-5 w-5" /> Buscar Experiencias
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select value={planSeleccionado} onValueChange={setPlanSeleccionado}>
            <SelectTrigger>
              <SelectValue placeholder="1. Selecciona Plan" />
            </SelectTrigger>
            <SelectContent>
              {planes.map((p: any) => (
                <SelectItem key={p.codigo} value={p.codigo}>
                  {p.propuesta} ({p.codigo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={materiaSeleccionada}
            onValueChange={setMateriaSeleccionada}
            disabled={!planSeleccionado}
          >
            <SelectTrigger>
              <SelectValue placeholder="2. Selecciona Materia" />
            </SelectTrigger>
            <SelectContent>
              {materias?.map((m: any) => (
                <SelectItem key={m.codigo} value={m.codigo}>
                  {m.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Select
              value={filtroCalificacion}
              onValueChange={setFiltroCalificacion}
              disabled={!materiaSeleccionada}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nota Mín." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Todas</SelectItem>
                <SelectItem value="4">4+</SelectItem>
                <SelectItem value="7">7+</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filtroTiempo}
              onValueChange={setFiltroTiempo}
              disabled={!materiaSeleccionada}
            >
              <SelectTrigger>
                <SelectValue placeholder="Antigüedad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Siempre</SelectItem>
                <SelectItem value="1year">Último año</SelectItem>
                <SelectItem value="2years">Últimos 2 años</SelectItem>
                <SelectItem value="5years">Últimos 5 años</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {materiaSeleccionada && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">
            Resultados ({experienciasFiltradas.length})
          </h3>
          {isLoadingExperienciasMateria ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {experienciasFiltradas.map((exp: any) => (
                <ExperienciaCard key={exp.id} experiencia={exp} />
              ))}
              {experienciasFiltradas.length === 0 && (
                <p className="text-muted-foreground col-span-full">
                  No se encontraron experiencias con estos filtros.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mis Experiencias */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpenCheck className="h-5 w-5 text-blue-600" />
            <CardTitle>Mis Experiencias</CardTitle>
          </div>
          <Button
            onClick={handleOpenCrear}
            disabled={examenesDisponibles.length === 0}
          >
            <PenSquare className="h-4 w-4 mr-2" /> Nueva
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingMisExperiencias ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <div className="space-y-3">
              {misExperiencias.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Aún no has compartido nada.
                </p>
              )}
              {misExperiencias.map((exp: any) => (
                <ExperienciaCard
                  key={exp.id}
                  experiencia={exp}
                  isOwner
                  onEdit={() => handleOpenEditar(exp)}
                  onDelete={() => handleDelete(exp.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          modalData ? "Editar Experiencia" : "Compartir Experiencia de Examen"
        }
        maxWidth="3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {!modalData && (
            <div className="space-y-2">
              <Label>¿Qué final rendiste?</Label>
              <Select
                onValueChange={(v) => setFormData({ ...formData, examenId: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un examen" />
                </SelectTrigger>
                <SelectContent>
                  {examenesDisponibles.map((ex: any) => (
                    <SelectItem key={ex.id} value={ex.id.toString()}>
                      {ex.materiaNombre} ({ex.fecha}) - Nota: {ex.nota}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Dificultad Percibida</Label>
                <span className="text-sm font-bold text-blue-600">
                  {formData.dificultad}/10
                </span>
              </div>
              <Input
                type="range"
                min="1"
                max="10"
                value={formData.dificultad}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dificultad: parseInt(e.target.value),
                  })
                }
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <Label>Modalidad</Label>
              <Select
                value={formData.modalidad}
                onValueChange={(v) =>
                  setFormData({ ...formData, modalidad: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ESCRITO">Escrito</SelectItem>
                  <SelectItem value="ORAL">Oral</SelectItem>
                  <SelectItem value="ESCRITO Y ORAL">Escrito y Oral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Días de Estudio (aprox.)</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="1"
                  className="pl-10"
                  value={formData.diasEstudio}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      diasEstudio: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Horas por Día (promedio)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="1"
                  max="24"
                  className="pl-10"
                  value={formData.horasDiarias}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      horasDiarias: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Intentos Previos</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="0"
                  className="pl-10"
                  value={formData.intentosPrevios}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      intentosPrevios: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Motivación Principal</Label>
              <Select
                value={formData.motivacion}
                onValueChange={(v) =>
                  setFormData({ ...formData, motivacion: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOTIVACIONES_DISPONIBLES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Recursos Utilizados</Label>
            <div className="grid grid-cols-2 gap-3 p-4 bg-muted/30 rounded-lg border">
              {RECURSOS_DISPONIBLES.map((rec) => (
                <div key={rec} className="flex items-center gap-2">
                  <Checkbox
                    id={rec}
                    checked={formData.recursos.includes(rec)}
                    onCheckedChange={(checked) => {
                      if (checked)
                        setFormData({
                          ...formData,
                          recursos: [...formData.recursos, rec],
                        });
                      else
                        setFormData({
                          ...formData,
                          recursos: formData.recursos.filter((r) => r !== rec),
                        });
                    }}
                  />
                  <Label htmlFor={rec} className="cursor-pointer font-normal">
                    {rec}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {showResumenInput && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label>Link o Contacto del Resumen</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="https://drive.google.com/... o @instagram / mail"
                  className="pl-10"
                  value={formData.linkResumen}
                  onChange={(e) =>
                    setFormData({ ...formData, linkResumen: e.target.value })
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Si es un link (Drive, Notion), se mostrará un botón. Si es
                texto, se mostrará como contacto.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" type="button" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Guardar Experiencia
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function ExperienciaCard({ experiencia, isOwner, onEdit, onDelete }: any) {
  // Detector inteligente de URL
  const getValidUrl = (text: string) => {
    if (!text) return null;
    const trimmed = text.trim();

    // Si tiene espacios, asumimos que es texto/nombre, no URL
    if (trimmed.includes(" ")) return null;

    // Si empieza con http/www o tiene un punto (ej: google.com), intentamos formarlo
    if (trimmed.match(/^(http|https|www\.)/) || trimmed.includes(".")) {
      let url = trimmed;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
      }
      try {
        new URL(url); // Validación estricta
        return url;
      } catch {
        return null;
      }
    }
    return null;
  };

  const validUrl = getValidUrl(experiencia.linkResumen);

  return (
    <Card className="hover:shadow-md transition-all h-full flex flex-col">
      <CardHeader className="pb-3 bg-muted/20 border-b">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-base font-bold text-blue-700 dark:text-blue-400">
              {isOwner
                ? experiencia.nombreMateria
                : `Nota: ${experiencia.nota}`}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <CalendarDays className="h-3 w-3" />
              {experiencia.fechaExamen}
            </CardDescription>
          </div>
          {isOwner ? (
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={onEdit}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">
                Dificultad: {experiencia.dificultad}/10
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3 flex-1 text-sm">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded flex items-center gap-2">
            <Clock className="h-3 w-3 text-blue-600" />
            <span>
              <strong>{experiencia.diasEstudio}</strong> días
            </span>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded flex items-center gap-2">
            <BarChart3 className="h-3 w-3 text-purple-600" />
            <span>
              <strong>{experiencia.horasDiarias}</strong> hs/día
            </span>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded flex items-center gap-2">
            <Hash className="h-3 w-3 text-orange-600" />
            <span>
              <strong>{experiencia.intentosPrevios}</strong> intentos
            </span>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded flex items-center gap-2 truncate">
            <Target className="h-3 w-3" />
            <span className="truncate">{experiencia.modalidad}</span>
          </div>
        </div>

        <div className="text-muted-foreground flex gap-2 items-start">
          <Target className="h-4 w-4 mt-0.5 shrink-0" />
          <p className="italic text-xs">{experiencia.motivacion}</p>
        </div>

        <div className="flex gap-2 items-start">
          <Book className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
          <p className="text-muted-foreground line-clamp-2 text-xs">
            {experiencia.recursos}
          </p>
        </div>

        {experiencia.linkResumen && (
          <div className="pt-3 mt-auto border-t">
            {validUrl ? (
              <a
                href={validUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex justify-center items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 py-1.5 rounded text-xs font-semibold transition-colors"
              >
                <ExternalLink className="h-3 w-3" /> Ver Resumen
              </a>
            ) : (
              <div className="flex items-center gap-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded text-muted-foreground">
                <Contact className="h-3 w-3 shrink-0" />
                <span className="truncate font-medium">
                  {experiencia.linkResumen}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
