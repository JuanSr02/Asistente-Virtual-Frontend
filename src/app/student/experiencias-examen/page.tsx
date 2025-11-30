"use client";

import { useState, useEffect, useRef } from "react";
import planesEstudioService from "@/services/planesEstudioService";
import experienciaService from "@/services/experienciaService";
import historiaAcademicaService from "@/services/historiaAcademicaService";
import Modal from "@/components/modals/Modal";
import { useModalPersistence } from "@/hooks/useModalPersistence";
import personaService from "@/services/personaService";
import { usePersistedState } from "@/hooks/usePersistedState";
import { Skeleton as UiSkeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  AlertTriangle,
  CheckCircle,
  GraduationCap,
  MessageSquareQuote,
  FileSearch,
  PenSquare,
  Edit,
  Trash2,
  Link,
  Book,
  SlidersHorizontal,
  BookOpenCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Definición de interfaces básicas para TypeScript
interface Experiencia {
  id: number;
  fechaExamen: string;
  nota: number;
  dificultad: number;
  diasEstudio: number;
  horasDiarias: number;
  intentosPrevios: number;
  modalidad: string;
  recursos: string;
  motivacion: string;
  linkResumen?: string;
  nombreMateria?: string;
}

interface ExperienciasExamenProps {
  user: any; // Se puede refinar con el tipo User de Supabase si está disponible
}

export default function ExperienciasExamen({ user }: ExperienciasExamenProps) {
  const [loading, setLoading] = useState(true);
  const [loadingMaterias, setLoadingMaterias] = useState(false);
  const [loadingExperiencias, setLoadingExperiencias] = useState(false);
  const [loadingMisExperiencias, setLoadingMisExperiencias] = useState(false);
  const [planes, setPlanes] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  const [experiencias, setExperiencias] = useState<Experiencia[]>([]);
  const [misExperiencias, setMisExperiencias] = useState<Experiencia[]>([]);
  const [examenesDisponibles, setExamenesDisponibles] = useState<any[]>([]);
  const [persona, setPersona] = useState<any>(null);
  const [historiaAcademica, setHistoriaAcademica] = useState<any>(null);
  const [planSeleccionado, setPlanSeleccionado] = usePersistedState(
    "plan-seleccionado",
    ""
  );
  const [materiaSeleccionada, setMateriaSeleccionada] =
    usePersistedState("materia-seleccionada", "");
  const [filtroCalificacion, setFiltroCalificacion] = usePersistedState(
    "filtro-calificacion",
    ""
  );
  const [filtroTiempo, setFiltroTiempo] = usePersistedState(
    "filtro-tiempo",
    "all"
  );
  const {
    isOpen: showCrearModal,
    data: experienciaEditando,
    openModal: openCrearModal,
    closeModal: closeCrearModal,
  } = useModalPersistence("crear-experiencia-modal");

  const [formData, setFormData] = usePersistedState("experiencia-form", {
    examenId: "",
    dificultad: 5,
    diasEstudio: 1,
    horasDiarias: 1,
    intentosPrevios: 0,
    modalidad: "ESCRITO",
    recursos: [] as string[],
    motivacion: "Solo para avanzar en la carrera",
    linkResumen: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const recursosDisponibles = [
    "Libros",
    "Diapositivas",
    "Resumen",
    "Videos",
    "Clases particulares",
  ];
  const motivacionesDisponibles = [
    "Se me vence",
    "Necesito las correlativas",
    "Solo para avanzar en la carrera",
    "Materia karma",
  ];

  // Función para filtrar experiencias por rango de tiempo
  const filtrarPorTiempo = (data: Experiencia[]) => {
    const hoy = new Date();
    switch (filtroTiempo) {
      case "1year":
        return data.filter((exp) => {
          const [dia, mes, año] = exp.fechaExamen.split("-");
          const fechaExamen = new Date(`${año}-${mes}-${dia}`);
          const unAnioAtras = new Date();
          unAnioAtras.setFullYear(hoy.getFullYear() - 1);
          return fechaExamen >= unAnioAtras;
        });
      case "2years":
        return data.filter((exp) => {
          const [dia, mes, año] = exp.fechaExamen.split("-");
          const fechaExamen = new Date(`${año}-${mes}-${dia}`);
          const dosAniosAtras = new Date();
          dosAniosAtras.setFullYear(hoy.getFullYear() - 2);
          return fechaExamen >= dosAniosAtras;
        });
      case "5years":
        return data.filter((exp) => {
          const [dia, mes, año] = exp.fechaExamen.split("-");
          const fechaExamen = new Date(`${año}-${mes}-${dia}`);
          const cincoAniosAtras = new Date();
          cincoAniosAtras.setFullYear(hoy.getFullYear() - 5);
          return fechaExamen >= cincoAniosAtras;
        });
      default:
        return data;
    }
  };

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    if (planSeleccionado) cargarMaterias(planSeleccionado);
    else {
      setMaterias([]);
      setMateriaSeleccionada("");
    }
  }, [planSeleccionado]);

  useEffect(() => {
    if (materiaSeleccionada && filtroCalificacion)
      cargarExperienciasPorMateria();
    else setExperiencias([]);
  }, [materiaSeleccionada, filtroCalificacion, filtroTiempo]);

  useEffect(() => {
    if (persona?.id) {
      historiaAcademicaService
        .verificarHistoriaAcademica(persona.id)
        .then((h) => {
          setHistoriaAcademica(h);
          if (h) {
            cargarMisExperiencias();
            cargarExamenesDisponibles();
          }
        })
        .catch(() => setHistoriaAcademica(null));
    }
  }, [persona]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      const personaData =
        (await personaService.obtenerPersonaPorSupabaseId(user.id)) ||
        (await personaService.obtenerPersonaPorEmail(user.email));
      if (!personaData) {
        setError("No se encontró tu perfil.");
        return;
      }
      setPersona(personaData);
      const historia =
        await historiaAcademicaService.verificarHistoriaAcademica(
          personaData.id
        );
      if (!historia) {
        const planesData = await planesEstudioService.obtenerPlanes();
        setPlanes(planesData || []);
        return;
      }
      const planesData = await planesEstudioService.obtenerPlanes();
      setPlanes(planesData || []);
    } catch (error) {
      setError("Error al cargar los datos iniciales.");
    } finally {
      setLoading(false);
    }
  };

  const cargarMaterias = async (codigoPlan: string) => {
    setLoadingMaterias(true);
    try {
      const data =
        await planesEstudioService.obtenerMateriasPorPlan(codigoPlan);
      setMaterias(data || []);
    } catch (error) {
      setMaterias([]);
    } finally {
      setLoadingMaterias(false);
    }
  };

  const cargarExperienciasPorMateria = async () => {
    if (!materiaSeleccionada) return;
    setLoadingExperiencias(true);
    try {
      const data =
        await experienciaService.obtenerExperienciasPorMateria(
          materiaSeleccionada
        );
      const filtradas = filtroCalificacion
        ? data.filter((e: any) => e.nota >= parseInt(filtroCalificacion))
        : data;
      const filtradasPorTiempo = filtrarPorTiempo(filtradas);
      setExperiencias(filtradasPorTiempo);
    } catch (error) {
      setExperiencias([]);
      setError("Error al cargar experiencias.");
    } finally {
      setLoadingExperiencias(false);
    }
  };

  const cargarMisExperiencias = async () => {
    if (!persona?.id) return;
    setLoadingMisExperiencias(true);
    try {
      const data = await experienciaService.obtenerExperienciasPorEstudiante(
        persona.id
      );
      setMisExperiencias(data);
    } catch (error) {
      setMisExperiencias([]);
    } finally {
      setLoadingMisExperiencias(false);
    }
  };

  const cargarExamenesDisponibles = async () => {
    if (!persona?.id) return;
    try {
      const examenes = await experienciaService.obtenerExamenesPorEstudiante(
        persona.id
      );
      const conExp = misExperiencias.map((e) => e.id);
      const sinExp = examenes.filter((e: any) => !conExp.includes(e.id));
      setExamenesDisponibles(sinExp);
    } catch (error) {
      setExamenesDisponibles([]);
    }
  };

  const handleCrearExperiencia = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dto = {
        ...formData,
        recursos: formData.recursos.join(", "),
        examenId: parseInt(formData.examenId),
        linkResumen: formData.linkResumen,
      };
      if (experienciaEditando) {
        await experienciaService.actualizarExperiencia(
          experienciaEditando.id,
          dto
        );
        setSuccess("Experiencia actualizada.");
      } else {
        await experienciaService.crearExperiencia(dto);
        setSuccess("Experiencia creada.");
      }
      closeCrearModal();
      resetFormData();
      cargarMisExperiencias();
      cargarExamenesDisponibles();
      cargarExperienciasPorMateria();
    } catch (error) {
      setError("Error al guardar la experiencia.");
    }
  };

  const handleEliminarExperiencia = async (id: number) => {
    if (!confirm("¿Seguro que quieres eliminar esta experiencia?")) return;
    try {
      await experienciaService.eliminarExperiencia(id);
      setSuccess("Experiencia eliminada.");
      cargarMisExperiencias();
      cargarExamenesDisponibles();
    } catch (error) {
      setError("Error al eliminar la experiencia.");
    }
  };

  const handleEditarExperiencia = (exp: any) => {
    setFormData({
      examenId: exp.id,
      dificultad: exp.dificultad,
      diasEstudio: exp.diasEstudio,
      horasDiarias: exp.horasDiarias,
      intentosPrevios: exp.intentosPrevios,
      modalidad: exp.modalidad,
      recursos: exp.recursos.split(", "),
      motivacion: exp.motivacion,
      linkResumen: exp.linkResumen,
    });
    openCrearModal(exp, "editar");
  };

  const resetFormData = () =>
    setFormData({
      examenId: "",
      dificultad: 5,
      diasEstudio: 1,
      horasDiarias: 1,
      intentosPrevios: 0,
      modalidad: "ESCRITO",
      recursos: [],
      motivacion: "Solo para avanzar en la carrera",
      linkResumen: "",
    });

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-800 text-red-800 dark:text-red-300 p-4 rounded-r-lg flex items-start gap-3 animate-fade-in">
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-800 text-green-800 dark:text-green-300 p-4 rounded-r-lg flex items-start gap-3 animate-fade-in">
          <CheckCircle className="h-5 w-5 mt-0.5" />
          <p className="text-sm">{success}</p>
        </div>
      )}

      <Card className="bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-purple-950/40 dark:via-background dark:to-pink-950/40">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
            <MessageSquareQuote className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Experiencias de Examen
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Descubre las experiencias de otros y comparte la tuya para ayudar a
            la comunidad.
          </CardDescription>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="space-y-6">
          <UiSkeleton className="h-28 w-full" />
          <UiSkeleton className="h-44 w-full" />
          <UiSkeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          {!historiaAcademica && persona ? (
            <Card>
              <CardHeader className="text-center">
                <GraduationCap className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <CardTitle>Carga tu Historia Académica</CardTitle>
                <CardDescription>
                  Para ver y compartir experiencias, primero ve a "Sugerencias"
                  y sube tu historia.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("changeTab", { detail: "recomendacion" })
                    )
                  }
                >
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Ir a Sugerencias
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <FileSearch className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    Buscar Experiencias
                  </CardTitle>
                  
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Select
                    onValueChange={setPlanSeleccionado}
                    value={planSeleccionado}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="1. Selecciona un Plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {planes.map((p) => (
                        <SelectItem key={p.codigo} value={p.codigo}>
                          {p.propuesta} ({p.codigo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    onValueChange={setMateriaSeleccionada}
                    value={materiaSeleccionada}
                    disabled={!planSeleccionado || loadingMaterias}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingMaterias
                            ? "Cargando..."
                            : "2. Selecciona una Materia"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {materias.map((m) => (
                        <SelectItem key={m.codigo} value={m.codigo}>
                          {m.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      onValueChange={setFiltroCalificacion}
                      value={filtroCalificacion}
                      disabled={!materiaSeleccionada}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="3. Filtra por Nota" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Todas</SelectItem>
                        <SelectItem value="4">4 o más</SelectItem>
                        <SelectItem value="6">6 o más</SelectItem>
                        <SelectItem value="8">8 o más</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      onValueChange={setFiltroTiempo}
                      value={filtroTiempo}
                      disabled={!materiaSeleccionada}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="4. Rango de tiempo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los tiempos</SelectItem>
                        <SelectItem value="1year">Último año</SelectItem>
                        <SelectItem value="2years">Últimos 2 años</SelectItem>
                        <SelectItem value="5years">Últimos 5 años</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {materiaSeleccionada && filtroCalificacion && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Resultados de Búsqueda ({experiencias.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingExperiencias ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-purple-500 dark:text-purple-400" />
                      </div>
                    ) : experiencias.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No se encontraron experiencias con esos filtros.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {experiencias.map((exp) => (
                          <ExperienciaCard key={exp.id} experiencia={exp} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <BookOpenCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      Mis Experiencias
                    </CardTitle>
                    <CardDescription>
                      Aquí puedes ver y gestionar tus aportes.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      resetFormData();
                      openCrearModal(null, "crear");
                    }}
                    disabled={examenesDisponibles.length === 0}
                    className="bg-blue-400 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                  >
                    <PenSquare className="mr-2 h-4 w-4" />
                    Compartir Nueva Experiencia
                  </Button>
                </CardHeader>
                <CardContent>
                  {loadingMisExperiencias ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-purple-500 dark:text-purple-400" />
                    </div>
                  ) : misExperiencias.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Aún no has compartido ninguna experiencia.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {misExperiencias.map((exp) => (
                        <ExperienciaCard
                          key={exp.id}
                          experiencia={exp}
                          isOwner={true}
                          onEdit={handleEditarExperiencia}
                          onDelete={handleEliminarExperiencia}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Modal
                isOpen={showCrearModal}
                onClose={closeCrearModal}
                title={
                  experienciaEditando
                    ? "Editar Experiencia"
                    : "Compartir Experiencia"
                }
                maxWidth="48rem"
              >
                <FormularioExperiencia
                  form={formData}
                  setForm={setFormData}
                  onSubmit={handleCrearExperiencia}
                  onClose={closeCrearModal}
                  isEditing={!!experienciaEditando}
                  examenes={examenesDisponibles}
                  recursos={recursosDisponibles}
                  motivaciones={motivacionesDisponibles}
                />
              </Modal>
            </>
          )}
        </>
      )}
    </div>
  );
}

// --- SUB-COMPONENTES PARA ORGANIZAR EL JSX ---

function ExperienciaCard({
  experiencia,
  isOwner = false,
  onEdit,
  onDelete,
}: any) {
  const getDificultadColor = (d: number) =>
    d >= 8
      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      : d >= 6
        ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
        : d >= 4
          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-col sm:flex-row justify-between gap-2">
        <div>
          <CardTitle className="text-base sm:text-lg">
            {isOwner ? experiencia.nombreMateria : `Nota: ${experiencia.nota}`}
          </CardTitle>
          <CardDescription>
            {`Examen del ${experiencia.fechaExamen}`}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {!isOwner && (
            <span
              className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getDificultadColor(
                experiencia.dificultad
              )}`}
            >
              Dificultad: {experiencia.dificultad}/10
            </span>
          )}
          {isOwner && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(experiencia)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(experiencia.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-center">
          <MetricItem label="Días Est." value={experiencia.diasEstudio} />
          <MetricItem label="Hrs/Día" value={experiencia.horasDiarias} />
          <MetricItem label="Modalidad" value={experiencia.modalidad} />
          <MetricItem
            label="Dificultad"
            value={`${experiencia.dificultad}/10`}
          />
          <MetricItem label="Intentos" value={experiencia.intentosPrevios} />
        </div>
        <DetailItem icon={Book} label="Recursos" value={experiencia.recursos} />
        <DetailItem
          icon={SlidersHorizontal}
          label="Motivación"
          value={experiencia.motivacion}
        />
        {experiencia.linkResumen && (
          <a
            href={experiencia.linkResumen}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-purple-600 dark:text-purple-400 hover:underline"
          >
            <Link className="h-4 w-4 mr-2" />
            Ver Resumen
          </a>
        )}
      </CardContent>
    </Card>
  );
}

function MetricItem({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-muted p-2 rounded-lg">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-bold text-sm">{value}</p>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }: any) {
  return (
    <div>
      <h5 className="font-semibold text-foreground mb-1 text-sm flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}:
      </h5>
      <p className="text-muted-foreground bg-muted p-3 rounded-lg text-sm">
        {value}
      </p>
    </div>
  );
}

function FormularioExperiencia({
  form,
  setForm,
  onSubmit,
  onClose,
  isEditing,
  examenes,
  recursos,
  motivaciones,
}: any) {
  const handleRecursoChange = (rec: string) =>
    setForm((prev: any) => ({
      ...prev,
      recursos: prev.recursos.includes(rec)
        ? prev.recursos.filter((r: string) => r !== rec)
        : [...prev.recursos, rec],
    }));

  return (
    <form onSubmit={onSubmit} className="space-y-6 p-1">
      {!isEditing && (
        <div className="space-y-2">
          <Label>Examen Rendido *</Label>
          <Select
            onValueChange={(v) => setForm({ ...form, examenId: v })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un examen" />
            </SelectTrigger>
            <SelectContent>
              {examenes.map((ex: any) => (
                <SelectItem key={ex.id} value={ex.id.toString()}>
                  {ex.materiaNombre} • {ex.fecha} • Nota: {ex.nota}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Dificultad Percibida: {form.dificultad}/10</Label>
          <Input
            type="range"
            min="1"
            max="10"
            value={form.dificultad}
            onChange={(e) =>
              setForm({ ...form, dificultad: parseInt(e.target.value) })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Modalidad *</Label>
          <Select
            onValueChange={(v) => setForm({ ...form, modalidad: v })}
            value={form.modalidad}
            required
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
        <FormNumericInput
          label="Días de Estudio"
          value={form.diasEstudio}
          onChange={(v: any) => setForm({ ...form, diasEstudio: v })}
          min={1}
        />
        <FormNumericInput
          label="Horas por Día"
          value={form.horasDiarias}
          onChange={(v: any) => setForm({ ...form, horasDiarias: v })}
          min={1}
        />
        <FormNumericInput
          label="Intentos Previos"
          value={form.intentosPrevios}
          onChange={(v: any) => setForm({ ...form, intentosPrevios: v })}
          min={0}
        />
        <div className="space-y-2">
          <Label>Motivación *</Label>
          <Select
            onValueChange={(v) => setForm({ ...form, motivacion: v })}
            value={form.motivacion}
            required
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {motivaciones.map((m: string) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Recursos Utilizados</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {recursos.map((rec: string) => (
            <div key={rec} className="flex items-center gap-2">
              <Checkbox
                id={rec}
                checked={form.recursos.includes(rec)}
                onCheckedChange={() => handleRecursoChange(rec)}
              />
              <Label htmlFor={rec} className="cursor-pointer">
                {rec}
              </Label>
            </div>
          ))}
        </div>
      </div>
      {(form.recursos.includes("Resumen") || form.linkResumen) && (
        <div className="space-y-2">
          <Label>Link al Resumen (Opcional)</Label>
          <Input
            type="url"
            value={form.linkResumen || ""}
            onChange={(e) => setForm({ ...form, linkResumen: e.target.value })}
            placeholder="https://drive.google.com/..."
          />
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="submit"
          className="w-full bg-blue-400 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
        >
          {isEditing ? "Actualizar" : "Compartir"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="w-full"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function FormNumericInput({ label, value, onChange, min }: any) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          -
        </Button>
        <Input
          type="number"
          min={min}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || min)}
          className="w-16 text-center"
        />{" "}
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={() => onChange(value + 1)}
        >
          +
        </Button>
      </div>
    </div>
  );
}
