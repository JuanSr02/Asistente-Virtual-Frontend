# 🗄️ Estado Global

## Visión General

El proyecto utiliza una estrategia dual para la gestión de estado:
- **Zustand**: Para estado del cliente (UI, modales, preferencias)
- **TanStack Query**: Para estado del servidor (datos de API, cache)

---

## Arquitectura de Estado

```
┌─────────────────────────────────────────────────────┐
│              Estado de la Aplicación                │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────┐      ┌──────────────────┐   │
│  │  Zustand Stores  │      │  TanStack Query  │   │
│  │  (Client State)  │      │  (Server State)  │   │
│  ├──────────────────┤      ├──────────────────┤   │
│  │                  │      │                  │   │
│  │ • UI State       │      │ • API Data       │   │
│  │ • Modals         │      │ • Cache          │   │
│  │ • Preferences    │      │ • Mutations      │   │
│  │ • Temp Data      │      │ • Sync           │   │
│  │                  │      │                  │   │
│  └──────────────────┘      └──────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Zustand - Client State

### Stores Implementados

#### 1. Modal Store

**Ubicación**: `src/stores/modal-store.ts`

Gestiona el estado de modales en la aplicación.

```typescript
import { create } from 'zustand';

interface ModalStore {
  // Estado
  isOpen: boolean;
  modalType: string | null;
  modalData: any;
  
  // Acciones
  openModal: (type: string, data?: any) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isOpen: false,
  modalType: null,
  modalData: null,
  
  openModal: (type, data) => set({
    isOpen: true,
    modalType: type,
    modalData: data,
  }),
  
  closeModal: () => set({
    isOpen: false,
    modalType: null,
    modalData: null,
  }),
}));
```

**Uso**:

```typescript
import { useModalStore } from '@/stores/modal-store';

function Component() {
  const { isOpen, modalType, openModal, closeModal } = useModalStore();
  
  const handleOpenModal = () => {
    openModal('crear-experiencia', { materiaId: '123' });
  };
  
  return (
    <div>
      <Button onClick={handleOpenModal}>Abrir Modal</Button>
      
      {isOpen && modalType === 'crear-experiencia' && (
        <CrearExperienciaModal onClose={closeModal} />
      )}
    </div>
  );
}
```

#### 2. UI Store

**Ubicación**: `src/stores/ui-store.ts`

Gestiona el estado de la interfaz de usuario.

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  // Estado
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  
  // Acciones
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'system',
      
      toggleSidebar: () => set((state) => ({
        sidebarOpen: !state.sidebarOpen
      })),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-storage', // Nombre en localStorage
    }
  )
);
```

**Uso**:

```typescript
import { useUIStore } from '@/stores/ui-store';

function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  
  return (
    <aside className={sidebarOpen ? 'open' : 'closed'}>
      <Button onClick={toggleSidebar}>Toggle</Button>
      {/* Contenido del sidebar */}
    </aside>
  );
}
```

---

## TanStack Query - Server State

### Configuración

**Ubicación**: `src/lib/query-client.ts`

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Query Keys

**Ubicación**: `src/lib/query-keys.ts`

Organización centralizada de query keys.

```typescript
export const sharedKeys = {
  all: ['shared'] as const,
  planes: () => [...sharedKeys.all, 'planes'] as const,
  materiasPorPlan: (plan: string) =>
    [...sharedKeys.all, 'materias', plan] as const,
};

export const studentKeys = {
  all: ['student'] as const,
  persona: (userId: string) =>
    [...studentKeys.all, 'persona', userId] as const,
  historia: (userId: string) =>
    [...studentKeys.all, 'historia', userId] as const,
  recomendaciones: (userId: string, criterio: string) =>
    [...studentKeys.all, 'recomendaciones', userId, criterio] as const,
  experiencias: {
    misExperiencias: (userId: string) =>
      [...studentKeys.all, 'experiencias', 'mias', userId] as const,
    porMateria: (materiaId: string) =>
      [...studentKeys.all, 'experiencias', 'materia', materiaId] as const,
  },
};

export const adminKeys = {
  all: ['admin'] as const,
  stats: {
    general: () => [...adminKeys.all, 'stats', 'general'] as const,
    carrera: (plan: string, periodo: string) =>
      [...adminKeys.all, 'stats', 'carrera', plan, periodo] as const,
  },
};
```

---

## Hooks de Dominio

### useHistoriaAcademica

**Ubicación**: `src/hooks/domain/useHistoriaAcademica.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { historiaAcademicaService } from '@/services/historiaAcademicaService';
import { studentKeys } from '@/lib/query-keys';
import { useToast } from '@/hooks/use-toast';

export const useHistoriaAcademica = (userId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query para obtener historia
  const historiaQuery = useQuery({
    queryKey: studentKeys.historia(userId),
    queryFn: () => historiaAcademicaService.obtenerHistoria(userId),
    enabled: !!userId,
  });

  // Mutation para cargar historia
  const cargarHistoriaMutation = useMutation({
    mutationFn: (file: File) =>
      historiaAcademicaService.cargarHistoria(userId, file),
    onSuccess: () => {
      queryClient.invalidateQueries(studentKeys.historia(userId));
      toast({
        title: 'Éxito',
        description: 'Historia académica cargada correctamente',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudo cargar la historia académica',
        variant: 'destructive',
      });
    },
  });

  // Mutation para eliminar historia
  const eliminarHistoriaMutation = useMutation({
    mutationFn: () => historiaAcademicaService.eliminarHistoria(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(studentKeys.historia(userId));
      toast({
        title: 'Éxito',
        description: 'Historia académica eliminada',
      });
    },
  });

  return {
    // Query
    historia: historiaQuery.data,
    isLoading: historiaQuery.isLoading,
    isError: historiaQuery.isError,
    error: historiaQuery.error,
    
    // Mutations
    cargarHistoria: cargarHistoriaMutation.mutate,
    isCargarLoading: cargarHistoriaMutation.isLoading,
    
    eliminarHistoria: eliminarHistoriaMutation.mutate,
    isEliminarLoading: eliminarHistoriaMutation.isLoading,
  };
};
```

**Uso**:

```typescript
function HistoriaPage() {
  const userId = '123';
  const {
    historia,
    isLoading,
    cargarHistoria,
    isCargarLoading,
  } = useHistoriaAcademica(userId);

  const handleFileUpload = (file: File) => {
    cargarHistoria(file);
  };

  if (isLoading) return <Skeleton />;

  return (
    <div>
      <FileUpload onUpload={handleFileUpload} loading={isCargarLoading} />
      <HistoriaTable materias={historia} />
    </div>
  );
}
```

---

### useExperiencias

**Ubicación**: `src/hooks/domain/useExperiencias.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { experienciaService } from '@/services/experienciaService';
import { studentKeys } from '@/lib/query-keys';
import { useToast } from '@/hooks/use-toast';

export const useExperiencias = (userId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query para obtener mis experiencias
  const misExperienciasQuery = useQuery({
    queryKey: studentKeys.experiencias.misExperiencias(userId),
    queryFn: () => experienciaService.obtenerExperienciasPorEstudiante(userId),
    enabled: !!userId,
  });

  // Mutation para crear experiencia
  const crearMutation = useMutation({
    mutationFn: experienciaService.crearExperiencia,
    onSuccess: () => {
      queryClient.invalidateQueries(
        studentKeys.experiencias.misExperiencias(userId)
      );
      toast({
        title: 'Éxito',
        description: 'Experiencia creada correctamente',
      });
    },
  });

  // Mutation para actualizar experiencia
  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      experienciaService.actualizarExperiencia(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(
        studentKeys.experiencias.misExperiencias(userId)
      );
      toast({
        title: 'Éxito',
        description: 'Experiencia actualizada',
      });
    },
  });

  // Mutation para eliminar experiencia
  const eliminarMutation = useMutation({
    mutationFn: experienciaService.eliminarExperiencia,
    onSuccess: () => {
      queryClient.invalidateQueries(
        studentKeys.experiencias.misExperiencias(userId)
      );
      toast({
        title: 'Éxito',
        description: 'Experiencia eliminada',
      });
    },
  });

  return {
    // Queries
    experiencias: misExperienciasQuery.data,
    isLoading: misExperienciasQuery.isLoading,
    
    // Mutations
    crear: crearMutation.mutate,
    actualizar: actualizarMutation.mutate,
    eliminar: eliminarMutation.mutate,
    
    // Loading states
    isCreando: crearMutation.isLoading,
    isActualizando: actualizarMutation.isLoading,
    isEliminando: eliminarMutation.isLoading,
  };
};
```

---

### useInscripciones

**Ubicación**: `src/hooks/domain/useInscripciones.ts`

```typescript
export const useInscripciones = (userId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query para obtener mis inscripciones
  const misInscripcionesQuery = useQuery({
    queryKey: studentKeys.misInscripciones(userId),
    queryFn: () => inscripcionService.obtenerMisInscripciones(userId),
    enabled: !!userId,
  });

  // Query para obtener materias disponibles
  const materiasDisponiblesQuery = useQuery({
    queryKey: studentKeys.materiasInscripcion(userId),
    queryFn: () => inscripcionService.obtenerMateriasParaInscripcion(userId),
    enabled: !!userId,
  });

  // Mutation para inscribirse
  const inscribirseMutation = useMutation({
    mutationFn: inscripcionService.inscribirseAMesa,
    onSuccess: () => {
      queryClient.invalidateQueries(studentKeys.misInscripciones(userId));
      queryClient.invalidateQueries(studentKeys.materiasInscripcion(userId));
      toast({
        title: 'Éxito',
        description: 'Inscripción realizada correctamente',
      });
    },
  });

  // Mutation para cancelar inscripción
  const cancelarMutation = useMutation({
    mutationFn: inscripcionService.cancelarInscripcion,
    onSuccess: () => {
      queryClient.invalidateQueries(studentKeys.misInscripciones(userId));
      toast({
        title: 'Éxito',
        description: 'Inscripción cancelada',
      });
    },
  });

  return {
    // Queries
    inscripciones: misInscripcionesQuery.data,
    materiasDisponibles: materiasDisponiblesQuery.data,
    isLoading: misInscripcionesQuery.isLoading,
    
    // Mutations
    inscribirse: inscribirseMutation.mutate,
    cancelar: cancelarMutation.mutate,
    
    // Loading states
    isInscribiendo: inscribirseMutation.isLoading,
    isCancelando: cancelarMutation.isLoading,
  };
};
```

---

## Patrones de Estado

### 1. Optimistic Updates

```typescript
const actualizarMutation = useMutation({
  mutationFn: updateData,
  onMutate: async (newData) => {
    // Cancelar queries en progreso
    await queryClient.cancelQueries(['data']);
    
    // Snapshot del valor anterior
    const previousData = queryClient.getQueryData(['data']);
    
    // Actualizar optimísticamente
    queryClient.setQueryData(['data'], newData);
    
    // Retornar contexto con snapshot
    return { previousData };
  },
  onError: (err, newData, context) => {
    // Revertir en caso de error
    queryClient.setQueryData(['data'], context.previousData);
  },
  onSettled: () => {
    // Refetch después de error o éxito
    queryClient.invalidateQueries(['data']);
  },
});
```

### 2. Infinite Queries

```typescript
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['experiencias'],
  queryFn: ({ pageParam = 1 }) =>
    fetchExperiencias({ page: pageParam }),
  getNextPageParam: (lastPage) =>
    lastPage.hasMore ? lastPage.nextPage : undefined,
});
```

### 3. Dependent Queries

```typescript
// Query 1: Obtener usuario
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
});

// Query 2: Obtener datos del usuario (depende de Query 1)
const { data: userData } = useQuery({
  queryKey: ['userData', user?.id],
  queryFn: () => fetchUserData(user!.id),
  enabled: !!user, // Solo ejecutar si user existe
});
```

---

## DevTools

### TanStack Query DevTools

Ya incluido en el proyecto:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  {children}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

**Características**:
- Ver todas las queries activas
- Inspeccionar cache
- Forzar refetch
- Ver estado de mutations
- Timeline de eventos

---

## Mejores Prácticas

### 1. Usar Query Keys Centralizadas

```typescript
// ✅ Bueno
const { data } = useQuery({
  queryKey: studentKeys.historia(userId),
  queryFn: () => fetchHistoria(userId),
});

// ❌ Malo
const { data } = useQuery({
  queryKey: ['historia', userId],
  queryFn: () => fetchHistoria(userId),
});
```

### 2. Invalidar Queries Relacionadas

```typescript
// Después de crear una experiencia, invalidar queries relacionadas
onSuccess: () => {
  queryClient.invalidateQueries(studentKeys.experiencias.misExperiencias(userId));
  queryClient.invalidateQueries(studentKeys.experiencias.porMateria(materiaId));
}
```

### 3. Manejar Estados de Carga

```typescript
const { data, isLoading, isError, error } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
});

if (isLoading) return <Skeleton />;
if (isError) return <Error message={error.message} />;
if (!data) return <Empty />;

return <DataDisplay data={data} />;
```

---

**Próximo**: [Autenticación y Autorización →](./07-autenticacion.md)
