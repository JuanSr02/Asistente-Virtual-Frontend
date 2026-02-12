# 🔌 Servicios y API

## Visión General

La capa de servicios actúa como intermediario entre los componentes React y las APIs backend, encapsulando toda la lógica de comunicación HTTP y proporcionando una interfaz limpia y type-safe.

---

## Arquitectura de Servicios

```
Componentes React
       ↓
  Custom Hooks (useQuery/useMutation)
       ↓
  Services Layer
       ↓
  Axios Client (con interceptors)
       ↓
  Backend APIs (Spring Boot + Supabase)
```

---

## Cliente HTTP (Axios)

### Configuración Base

**Ubicación**: `src/lib/axios-client.ts`

```typescript
import axios, { AxiosInstance } from "axios";
import { API_BASE_URL, AXIOS_CONFIG } from "@/lib/config";
import { supabase } from "@/supabaseClient";

const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  ...AXIOS_CONFIG,
});

// Interceptor de Request: Inyecta JWT token
axiosClient.interceptors.request.use(
  async (config) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor de Response: Manejo de errores
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Sesión expirada");
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
```

---

## Configuración de API

**Ubicación**: `src/lib/config.ts`

```typescript
export const API_BASE_URL =
  "https://asistente-virtual-backend-wj8t.onrender.com";

export const API_ROUTES = {
  ADMIN: {
    CARGAR_PLAN: "/api/admin/planes-estudio/carga",
    ELIMINAR_PLAN: "/api/admin/planes-estudio",
    CREAR_ADMINISTRADOR: "/api/admin/administradores",
    // ...
  },
  SHARED: {
    ESTADISTICAS_GENERALES: "/api/shared/estadisticas/generales",
    ESTADISTICAS_MATERIA: "/api/shared/estadisticas/materia/",
    PLANES_ESTUDIO: "/api/shared/planes-estudio",
    EXPERIENCIAS: "/api/shared/experiencias",
    INSCRIPCIONES: "/api/shared/inscripciones",
    // ...
  },
  ESTUDIANTE: {
    FINALES_PARA_RENDIR: "/api/shared/finales",
    HISTORIA_ACADEMICA: "/api/shared/historia-academica/",
    // ...
  },
};
```

---

## Servicios Implementados

### 1. **Estadísticas Service**

**Ubicación**: `src/services/estadisticasService.ts`

```typescript
import axiosClient from "@/lib/axios-client";
import { API_ROUTES } from "@/lib/config";

export const estadisticasService = {
  // Obtener estadísticas generales
  obtenerEstadisticasGenerales: async () => {
    const { data } = await axiosClient.get(
      API_ROUTES.SHARED.ESTADISTICAS_GENERALES,
    );
    return data;
  },

  // Obtener estadísticas por carrera
  obtenerEstadisticasPorCarrera: async (planId: string, periodo: string) => {
    const { data } = await axiosClient.get(
      `${API_ROUTES.SHARED.ESTADISTICAS_POR_CARRERA}/${planId}`,
      { params: { periodo } },
    );
    return data;
  },

  // Obtener estadísticas de una materia
  obtenerEstadisticasMateria: async (
    codigoMateria: string,
    periodo: string,
  ) => {
    const { data } = await axiosClient.get(
      `${API_ROUTES.SHARED.ESTADISTICAS_MATERIA}${codigoMateria}`,
      { params: { periodo } },
    );
    return data;
  },

  // Recalcular estadísticas (Admin)
  recalcularEstadisticas: async () => {
    const { data } = await axiosClient.post(
      API_ROUTES.SHARED.RECALCULAR_ESTADISTICAS,
    );
    return data;
  },
};
```

---

### 2. **Experiencias Service**

**Ubicación**: `src/services/experienciaService.ts`

```typescript
export const experienciaService = {
  // Obtener experiencias por materia
  obtenerExperienciasPorMateria: async (materiaId: string) => {
    const { data } = await axiosClient.get(
      `${API_ROUTES.SHARED.EXPERIENCIAS_POR_MATERIA}/${materiaId}`,
    );
    return data;
  },

  // Obtener experiencias del estudiante
  obtenerExperienciasPorEstudiante: async (userId: string) => {
    const { data } = await axiosClient.get(
      `${API_ROUTES.SHARED.EXPERIENCIAS_POR_ESTUDIANTE}/${userId}`,
    );
    return data;
  },

  // Crear nueva experiencia
  crearExperiencia: async (experiencia: ExperienciaCreate) => {
    const { data } = await axiosClient.post(
      API_ROUTES.SHARED.EXPERIENCIAS,
      experiencia,
    );
    return data;
  },

  // Actualizar experiencia
  actualizarExperiencia: async (id: string, experiencia: ExperienciaUpdate) => {
    const { data } = await axiosClient.put(
      `${API_ROUTES.SHARED.EXPERIENCIAS}/${id}`,
      experiencia,
    );
    return data;
  },

  // Eliminar experiencia
  eliminarExperiencia: async (id: string) => {
    const { data } = await axiosClient.delete(
      `${API_ROUTES.SHARED.EXPERIENCIAS}/${id}`,
    );
    return data;
  },

  // Obtener exámenes disponibles para crear experiencia
  obtenerExamenesDisponibles: async (userId: string) => {
    const { data } = await axiosClient.get(
      `${API_ROUTES.SHARED.EXAMENES_POR_ESTUDIANTE}/${userId}`,
    );
    return data;
  },
};
```

---

### 3. **Historia Académica Service**

**Ubicación**: `src/services/historiaAcademicaService.ts`

```typescript
export const historiaAcademicaService = {
  // Obtener historia académica
  obtenerHistoria: async (userId: string) => {
    const { data } = await axiosClient.get(
      `${API_ROUTES.ESTUDIANTE.HISTORIA_ACADEMICA}${userId}`,
    );
    return data;
  },

  // Cargar historia desde archivo (PDF/Excel)
  cargarHistoria: async (userId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axiosClient.post(
      `${API_ROUTES.ESTUDIANTE.HISTORIA_ACADEMICA}${userId}/cargar`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return data;
  },

  // Eliminar historia académica
  eliminarHistoria: async (userId: string) => {
    const { data } = await axiosClient.delete(
      `${API_ROUTES.ESTUDIANTE.HISTORIA_ACADEMICA}${userId}`,
    );
    return data;
  },
};
```

---

### 4. **Inscripciones Service**

**Ubicación**: `src/services/inscripcionService.ts`

```typescript
export const inscripcionService = {
  // Obtener materias disponibles para inscripción
  obtenerMateriasParaInscripcion: async (userId: string) => {
    const { data } = await axiosClient.get(
      `${API_ROUTES.ESTUDIANTE.FINALES_PARA_RENDIR}/${userId}`,
    );
    return data;
  },

  // Obtener mis inscripciones
  obtenerMisInscripciones: async (userId: string) => {
    const { data } = await axiosClient.get(
      `${API_ROUTES.SHARED.INSCRIPCIONES}/estudiante/${userId}`,
    );
    return data;
  },

  // Inscribirse a una mesa
  inscribirseAMesa: async (inscripcion: InscripcionCreate) => {
    const { data } = await axiosClient.post(
      API_ROUTES.SHARED.INSCRIPCIONES,
      inscripcion,
    );
    return data;
  },

  // Cancelar inscripción
  cancelarInscripcion: async (inscripcionId: string) => {
    const { data } = await axiosClient.delete(
      `${API_ROUTES.SHARED.INSCRIPCIONES}/${inscripcionId}`,
    );
    return data;
  },

  // Obtener inscriptos a una mesa
  obtenerInscriptosMesa: async (materiaId: string, turno: string) => {
    const { data } = await axiosClient.get(
      `${API_ROUTES.SHARED.INSCRIPCIONES}/mesa`,
      { params: { materiaId, turno } },
    );
    return data;
  },

  // Actualizar visibilidad de contacto
  actualizarVisibilidadContacto: async (
    inscripcionId: string,
    visible: boolean,
  ) => {
    const { data } = await axiosClient.patch(
      `${API_ROUTES.SHARED.INSCRIPCIONES}/${inscripcionId}/visibilidad`,
      { visible },
    );
    return data;
  },
};
```

---

### 5. **Planes de Estudio Service**

**Ubicación**: `src/services/planesEstudioService.ts`

```typescript
export const planesEstudioService = {
  // Obtener todos los planes
  obtenerPlanes: async () => {
    const { data } = await axiosClient.get(API_ROUTES.SHARED.PLANES_ESTUDIO);
    return data;
  },

  // Obtener materias de un plan
  obtenerMateriasPorPlan: async (planId: string) => {
    const { data } = await axiosClient.get(
      `${API_ROUTES.SHARED.MATERIAS_POR_PLAN}/${planId}`,
    );
    return data;
  },

  // Cargar plan de estudio (Admin)
  cargarPlan: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axiosClient.post(
      API_ROUTES.ADMIN.CARGAR_PLAN,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return data;
  },

  // Eliminar plan (Admin)
  eliminarPlan: async (planId: string) => {
    const { data } = await axiosClient.delete(
      `${API_ROUTES.ADMIN.ELIMINAR_PLAN}/${planId}`,
    );
    return data;
  },
};
```

---

### 6. **Recomendaciones Service**

**Ubicación**: `src/services/recomendacionService.ts`

```typescript
export const recomendacionService = {
  // Obtener recomendaciones de finales
  obtenerRecomendaciones: async (
    userId: string,
    criterio: "CORRELATIVAS" | "VENCIMIENTO" | "DIFICULTAD" | "FUTURO",
  ) => {
    const { data } = await axiosClient.get(
      `/api/shared/recomendaciones/${userId}`,
      { params: { criterio } },
    );
    return data;
  },
};
```

---

### 7. **Perfil Service**

**Ubicación**: `src/services/perfilService.ts`

```typescript
export const perfilService = {
  // Obtener perfil del usuario
  obtenerPerfil: async (userId: string) => {
    const { data } = await axiosClient.get(
      `${API_ROUTES.SHARED.ACTUALIZAR_ESTUDIANTE}/${userId}`,
    );
    return data;
  },

  // Actualizar perfil
  actualizarPerfil: async (userId: string, perfil: PerfilUpdate) => {
    const { data } = await axiosClient.put(
      `${API_ROUTES.SHARED.ACTUALIZAR_ESTUDIANTE}/${userId}`,
      perfil,
    );
    return data;
  },

  // Eliminar cuenta
  eliminarCuenta: async (userId: string) => {
    const { data } = await axiosClient.delete(
      `${API_ROUTES.SHARED.ELIMINAR_ESTUDIANTE}/${userId}`,
    );
    return data;
  },
};
```

---

### 8. **Persona Service**

**Ubicación**: `src/services/personaService.ts`

```typescript
export const personaService = {
  // Obtener datos de persona
  obtenerPersona: async (userId: string) => {
    const { data } = await axiosClient.get(
      `${API_ROUTES.SHARED.OBTENER_PERSONA}/${userId}`,
    );
    return data;
  },
};
```

---

### 9. **Materia Service**

**Ubicación**: `src/services/materiaService.ts`

```typescript
export const materiaService = {
  // Obtener detalles de una materia
  obtenerMateria: async (materiaId: string) => {
    const { data } = await axiosClient.get(`/api/shared/materias/${materiaId}`);
    return data;
  },

  // Buscar materias
  buscarMaterias: async (query: string) => {
    const { data } = await axiosClient.get("/api/shared/materias/buscar", {
      params: { q: query },
    });
    return data;
  },
};
```

---

## Tipos TypeScript

### Tipos de Request/Response

**Ubicación**: `src/lib/types/index.ts`

```typescript
// Experiencia
export interface ExperienciaCreate {
  estudianteId: string;
  materiaId: string;
  turno: string;
  anio: number;
  modalidad: "PRESENCIAL" | "VIRTUAL";
  dificultad: 1 | 2 | 3 | 4 | 5;
  recursos: string;
  tips: string;
}

export interface ExperienciaUpdate {
  modalidad?: "PRESENCIAL" | "VIRTUAL";
  dificultad?: 1 | 2 | 3 | 4 | 5;
  recursos?: string;
  tips?: string;
}

// Inscripción
export interface InscripcionCreate {
  estudianteId: string;
  materiaId: string;
  turno: string;
  anio: number;
  compartirContacto: boolean;
}

// Perfil
export interface PerfilUpdate {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  planEstudioId?: string;
}
```

---

## Manejo de Errores

### Errores Comunes

```typescript
// Error 401: No autenticado
{
  status: 401,
  message: 'Unauthorized'
}

// Error 403: Sin permisos
{
  status: 403,
  message: 'Forbidden'
}

// Error 404: Recurso no encontrado
{
  status: 404,
  message: 'Not Found'
}

// Error 422: Validación fallida
{
  status: 422,
  message: 'Validation Error',
  errors: {
    field: ['Error message']
  }
}

// Error 500: Error del servidor
{
  status: 500,
  message: 'Internal Server Error'
}
```

### Manejo en Servicios

```typescript
export const ejemploService = {
  metodo: async () => {
    try {
      const { data } = await axiosClient.get("/endpoint");
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        throw new Error(message || "Error en la petición");
      }
      throw error;
    }
  },
};
```

---

## Testing de Servicios (Ejemplo Futuro)

> **Nota**: El testing no está implementado actualmente. Este es un ejemplo de cómo se testearían los servicios en el futuro.

### Mocking de Axios

```typescript
import axiosClient from "@/lib/axios-client";

jest.mock("@/lib/axios-client");
const mockedAxios = axiosClient as jest.Mocked<typeof axiosClient>;

describe("experienciaService", () => {
  it("debe obtener experiencias por materia", async () => {
    const mockData = [{ id: "1", materia: "Test" }];
    mockedAxios.get.mockResolvedValue({ data: mockData });

    const result =
      await experienciaService.obtenerExperienciasPorMateria("123");

    expect(result).toEqual(mockData);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining("123"),
    );
  });
});
```

---

## Mejores Prácticas

### 1. **Centralización de URLs**

Todas las URLs en `config.ts`, no hardcodeadas.

### 2. **Type Safety**

Todos los servicios con tipos TypeScript.

### 3. **Error Handling**

Manejo consistente de errores en todos los servicios.

### 4. **Interceptors**

Lógica común (auth, logging) en interceptors.

### 5. **Separación de Concerns**

Un servicio por dominio/entidad.

---

**Próximo**: [Estado Global →](./06-estado-global.md)
