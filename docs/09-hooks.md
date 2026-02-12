# 🪝 Hooks Personalizados

## Visión General

El proyecto utiliza hooks personalizados para encapsular lógica reutilizable, siguiendo las mejores prácticas de React y aprovechando TanStack Query para gestión de datos del servidor.

---

## Hooks de Dominio

### useHistoriaAcademica

**Ubicación**: `src/hooks/domain/useHistoriaAcademica.ts`

Gestiona la historia académica del estudiante.

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { historiaAcademicaService } from "@/services/historiaAcademicaService";
import { studentKeys } from "@/lib/query-keys";
import { useToast } from "@/hooks/use-toast";

export const useHistoriaAcademica = (userId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const historiaQuery = useQuery({
    queryKey: studentKeys.historia(userId),
    queryFn: () => historiaAcademicaService.obtenerHistoria(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  const cargarHistoriaMutation = useMutation({
    mutationFn: (file: File) =>
      historiaAcademicaService.cargarHistoria(userId, file),
    onSuccess: () => {
      queryClient.invalidateQueries(studentKeys.historia(userId));
      toast({
        title: "Éxito",
        description: "Historia académica cargada correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo cargar la historia académica",
        variant: "destructive",
      });
    },
  });

  return {
    historia: historiaQuery.data,
    isLoading: historiaQuery.isLoading,
    isError: historiaQuery.isError,
    cargarHistoria: cargarHistoriaMutation.mutate,
    isCargarLoading: cargarHistoriaMutation.isLoading,
  };
};
```

---

### useExperiencias

**Ubicación**: `src/hooks/domain/useExperiencias.ts`

Gestiona experiencias de examen.

```typescript
export const useExperiencias = (userId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Obtener mis experiencias
  const misExperienciasQuery = useQuery({
    queryKey: studentKeys.experiencias.misExperiencias(userId),
    queryFn: () => experienciaService.obtenerExperienciasPorEstudiante(userId),
    enabled: !!userId,
  });

  // Crear experiencia
  const crearMutation = useMutation({
    mutationFn: experienciaService.crearExperiencia,
    onSuccess: () => {
      queryClient.invalidateQueries(
        studentKeys.experiencias.misExperiencias(userId),
      );
      toast({ title: "Experiencia creada" });
    },
  });

  // Actualizar experiencia
  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      experienciaService.actualizarExperiencia(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(
        studentKeys.experiencias.misExperiencias(userId),
      );
      toast({ title: "Experiencia actualizada" });
    },
  });

  // Eliminar experiencia
  const eliminarMutation = useMutation({
    mutationFn: experienciaService.eliminarExperiencia,
    onSuccess: () => {
      queryClient.invalidateQueries(
        studentKeys.experiencias.misExperiencias(userId),
      );
      toast({ title: "Experiencia eliminada" });
    },
  });

  return {
    experiencias: misExperienciasQuery.data,
    isLoading: misExperienciasQuery.isLoading,
    crear: crearMutation.mutate,
    actualizar: actualizarMutation.mutate,
    eliminar: eliminarMutation.mutate,
    isCreando: crearMutation.isLoading,
    isActualizando: actualizarMutation.isLoading,
    isEliminando: eliminarMutation.isLoading,
  };
};
```

---

### useInscripciones

**Ubicación**: `src/hooks/domain/useInscripciones.ts`

Gestiona inscripciones a mesas de examen.

```typescript
export const useInscripciones = (userId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mis inscripciones
  const misInscripcionesQuery = useQuery({
    queryKey: studentKeys.misInscripciones(userId),
    queryFn: () => inscripcionService.obtenerMisInscripciones(userId),
    enabled: !!userId,
  });

  // Materias disponibles para inscripción
  const materiasDisponiblesQuery = useQuery({
    queryKey: studentKeys.materiasInscripcion(userId),
    queryFn: () => inscripcionService.obtenerMateriasParaInscripcion(userId),
    enabled: !!userId,
  });

  // Inscribirse a mesa
  const inscribirseMutation = useMutation({
    mutationFn: inscripcionService.inscribirseAMesa,
    onSuccess: () => {
      queryClient.invalidateQueries(studentKeys.misInscripciones(userId));
      queryClient.invalidateQueries(studentKeys.materiasInscripcion(userId));
      toast({ title: "Inscripción realizada" });
    },
  });

  // Cancelar inscripción
  const cancelarMutation = useMutation({
    mutationFn: inscripcionService.cancelarInscripcion,
    onSuccess: () => {
      queryClient.invalidateQueries(studentKeys.misInscripciones(userId));
      toast({ title: "Inscripción cancelada" });
    },
  });

  return {
    inscripciones: misInscripcionesQuery.data,
    materiasDisponibles: materiasDisponiblesQuery.data,
    isLoading: misInscripcionesQuery.isLoading,
    inscribirse: inscribirseMutation.mutate,
    cancelar: cancelarMutation.mutate,
    isInscribiendo: inscribirseMutation.isLoading,
    isCancelando: cancelarMutation.isLoading,
  };
};
```

---

### useRecomendaciones

**Ubicación**: `src/hooks/domain/useRecomendaciones.ts`

Obtiene recomendaciones de finales.

```typescript
export const useRecomendaciones = (
  userId: string,
  criterio: "CORRELATIVAS" | "VENCIMIENTO" | "DIFICULTAD" | "FUTURO",
) => {
  return useQuery({
    queryKey: studentKeys.recomendaciones(userId, criterio),
    queryFn: () =>
      recomendacionService.obtenerRecomendaciones(userId, criterio),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};
```

---

### usePlanesEstudio

**Ubicación**: `src/hooks/domain/usePlanesEstudio.ts`

Gestiona planes de estudio.

```typescript
export const usePlanesEstudio = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Obtener todos los planes
  const planesQuery = useQuery({
    queryKey: sharedKeys.planes(),
    queryFn: planesEstudioService.obtenerPlanes,
    staleTime: 30 * 60 * 1000, // 30 minutos
  });

  // Cargar plan (Admin)
  const cargarPlanMutation = useMutation({
    mutationFn: planesEstudioService.cargarPlan,
    onSuccess: () => {
      queryClient.invalidateQueries(sharedKeys.planes());
      toast({ title: "Plan de estudio cargado" });
    },
  });

  // Eliminar plan (Admin)
  const eliminarPlanMutation = useMutation({
    mutationFn: planesEstudioService.eliminarPlan,
    onSuccess: () => {
      queryClient.invalidateQueries(sharedKeys.planes());
      toast({ title: "Plan de estudio eliminado" });
    },
  });

  return {
    planes: planesQuery.data,
    isLoading: planesQuery.isLoading,
    cargarPlan: cargarPlanMutation.mutate,
    eliminarPlan: eliminarPlanMutation.mutate,
    isCargando: cargarPlanMutation.isLoading,
    isEliminando: eliminarPlanMutation.isLoading,
  };
};
```

---

### useEstadisticasGenerales

**Ubicación**: `src/hooks/domain/useEstadisticasGenerales.ts`

Obtiene estadísticas generales del sistema.

```typescript
export const useEstadisticasGenerales = () => {
  return useQuery({
    queryKey: adminKeys.stats.general(),
    queryFn: estadisticasService.obtenerEstadisticasGenerales,
    staleTime: 5 * 60 * 1000,
  });
};
```

---

### useEstadisticasCarrera

**Ubicación**: `src/hooks/domain/useEstadisticasCarrera.ts`

Obtiene estadísticas por carrera.

```typescript
export const useEstadisticasCarrera = (planId: string, periodo: string) => {
  return useQuery({
    queryKey: adminKeys.stats.carrera(planId, periodo),
    queryFn: () =>
      estadisticasService.obtenerEstadisticasPorCarrera(planId, periodo),
    enabled: !!planId && !!periodo,
  });
};
```

---

### useEstadisticasMateria

**Ubicación**: `src/hooks/domain/useEstadisticasMateria.ts`

Obtiene estadísticas de una materia.

```typescript
export const useEstadisticasMateria = (
  codigoMateria: string,
  periodo: string,
) => {
  return useQuery({
    queryKey: adminKeys.stats.materia(codigoMateria, periodo),
    queryFn: () =>
      estadisticasService.obtenerEstadisticasMateria(codigoMateria, periodo),
    enabled: !!codigoMateria && !!periodo,
  });
};
```

---

### usePerfil

**Ubicación**: `src/hooks/domain/usePerfil.ts`

Gestiona el perfil del usuario.

```typescript
export const usePerfil = (userId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const perfilQuery = useQuery({
    queryKey: studentKeys.persona(userId),
    queryFn: () => perfilService.obtenerPerfil(userId),
    enabled: !!userId,
  });

  const actualizarMutation = useMutation({
    mutationFn: (data: any) => perfilService.actualizarPerfil(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(studentKeys.persona(userId));
      toast({ title: "Perfil actualizado" });
    },
  });

  return {
    perfil: perfilQuery.data,
    isLoading: perfilQuery.isLoading,
    actualizar: actualizarMutation.mutate,
    isActualizando: actualizarMutation.isLoading,
  };
};
```

---

### usePersona

**Ubicación**: `src/hooks/domain/usePersona.ts`

Obtiene datos de persona.

```typescript
export const usePersona = (userId: string) => {
  return useQuery({
    queryKey: studentKeys.persona(userId),
    queryFn: () => personaService.obtenerPersona(userId),
    enabled: !!userId,
  });
};
```

---

## Hooks Generales

### useToast

**Ubicación**: `src/hooks/use-toast.ts`

Gestiona notificaciones toast.

```typescript
import { toast as sonnerToast } from "sonner";

export const useToast = () => {
  const toast = ({
    title,
    description,
    variant = "default",
    duration = 3000,
  }: {
    title: string;
    description?: string;
    variant?: "default" | "destructive";
    duration?: number;
  }) => {
    if (variant === "destructive") {
      sonnerToast.error(title, {
        description,
        duration,
      });
    } else {
      sonnerToast.success(title, {
        description,
        duration,
      });
    }
  };

  return { toast };
};
```

**Uso**:

```typescript
const { toast } = useToast();

toast({
  title: "Éxito",
  description: "Operación completada",
});

toast({
  title: "Error",
  description: "Algo salió mal",
  variant: "destructive",
});
```

---

### useMobile

**Ubicación**: `src/hooks/use-mobile.tsx`

Detecta si el dispositivo es móvil.

```typescript
import { useEffect, useState } from "react";

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};
```

**Uso**:

```typescript
const isMobile = useMobile();

return (
  <div>
    {isMobile ? <MobileLayout /> : <DesktopLayout />}
  </div>
);
```

---

### useUserRole

**Ubicación**: `src/hooks/useUserRole.ts`

Obtiene el rol del usuario autenticado.

```typescript
import { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";

export const useUserRole = () => {
  const [role, setRole] = useState<"ESTUDIANTE" | "ADMINISTRADOR" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const userRole = user.user_metadata?.rol || "ESTUDIANTE";
        setRole(userRole);
      }

      setLoading(false);
    };

    fetchRole();
  }, []);

  return {
    role,
    loading,
    isAdmin: role === "ADMINISTRADOR",
    isStudent: role === "ESTUDIANTE",
  };
};
```

**Uso**:

```typescript
const { role, isAdmin, loading } = useUserRole();

if (loading) return <Skeleton />;

return (
  <div>
    {isAdmin ? <AdminPanel /> : <StudentPanel />}
  </div>
);
```

---

### useConfirm

**Ubicación**: `src/hooks/use-confirm.ts`

Hook para confirmaciones.

```typescript
import { useState } from "react";

export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [resolveReject, setResolveReject] = useState<{
    resolve: (value: boolean) => void;
    reject: () => void;
  } | null>(null);

  const confirm = () => {
    return new Promise<boolean>((resolve, reject) => {
      setIsOpen(true);
      setResolveReject({ resolve, reject });
    });
  };

  const handleConfirm = () => {
    resolveReject?.resolve(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    resolveReject?.resolve(false);
    setIsOpen(false);
  };

  return {
    isOpen,
    confirm,
    handleConfirm,
    handleCancel,
  };
};
```

**Uso**:

```typescript
const { isOpen, confirm, handleConfirm, handleCancel } = useConfirm();

const handleDelete = async () => {
  const confirmed = await confirm();

  if (confirmed) {
    // Eliminar
  }
};

return (
  <>
    <Button onClick={handleDelete}>Eliminar</Button>

    <ConfirmModal
      isOpen={isOpen}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  </>
);
```

---

## Patrones de Hooks

### Hook Compuesto

```typescript
export const useFormWithValidation = (initialValues: any) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field: string, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const validate = () => {
    // Lógica de validación
    const newErrors = {};
    // ...
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    validate,
  };
};
```

### Hook con Cleanup

```typescript
export const useWebSocket = (url: string) => {
  const [data, setData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => setIsConnected(true);
    ws.onmessage = (event) => setData(JSON.parse(event.data));
    ws.onclose = () => setIsConnected(false);

    return () => {
      ws.close();
    };
  }, [url]);

  return { data, isConnected };
};
```

---

## Mejores Prácticas

### 1. Nombres Descriptivos

```typescript
// ✅ Bueno
const useUserProfile = (userId: string) => {};

// ❌ Malo
const useData = (id: string) => {};
```

### 2. Retornar Objetos

```typescript
// ✅ Bueno - fácil de extender
return {
  data,
  isLoading,
  error,
  refetch,
};

// ❌ Malo - difícil de extender
return [data, isLoading, error];
```

### 3. Memoización

```typescript
const value = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

const callback = useCallback(() => {
  doSomething(value);
}, [value]);
```

---

**Próximo**: [Configuración y Deployment →](./10-configuracion-deployment.md)
