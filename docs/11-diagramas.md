# 📊 Diagramas del Sistema

Esta sección contiene diagramas visuales de la arquitectura, flujos de datos y componentes del sistema.

---

## 1. Diagrama de Arquitectura General

```mermaid
graph TB
    subgraph "Cliente (Browser)"
        PWA[PWA - Next.js 16]
        UI[Componentes React]
        State[Estado Global]
        Cache[TanStack Query Cache]
    end

    subgraph "Capa de Servicios"
        Services[Services Layer]
        Axios[Axios Client]
    end

    subgraph "Backend - API Principal"
        SpringBoot[Spring Boot API]
        Controllers[Controllers]
        BusinessLogic[Business Logic]
        DB1[(PostgreSQL)]
    end

    subgraph "Backend - Supabase BaaS"
        Auth[Authentication]
        DB2[(PostgreSQL)]
        Storage[Storage]
    end

    PWA --> UI
    UI --> State
    UI --> Cache
    Cache --> Services
    Services --> Axios
    
    Axios --> SpringBoot
    Axios --> Auth
    
    SpringBoot --> Controllers
    Controllers --> BusinessLogic
    BusinessLogic --> DB1
    
    Auth --> DB2
    Auth --> Storage

    style PWA fill:#3b82f6,color:#fff
    style SpringBoot fill:#22c55e,color:#fff
    style Auth fill:#8b5cf6,color:#fff
```

---

## 2. Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant L as Login Form
    participant S as Supabase Auth
    participant A as Axios Client
    participant API as Spring Boot API

    U->>L: Ingresa credenciales
    L->>S: Solicita autenticación
    S->>S: Valida credenciales
    S-->>L: Retorna JWT Token + Session
    L->>L: Guarda sesión en localStorage
    
    Note over U,API: Usuario autenticado
    
    U->>A: Hace request a API
    A->>S: Obtiene token actual
    S-->>A: Retorna access_token
    A->>A: Inyecta token en headers
    A->>API: Request con Authorization header
    API->>API: Valida JWT
    API-->>A: Response con datos
    A-->>U: Muestra datos en UI
```

---

## 3. Flujo de Datos con TanStack Query

```mermaid
graph LR
    A[Componente React] -->|useQuery| B[TanStack Query]
    B -->|Cache Miss| C[Service Function]
    C -->|HTTP Request| D[Axios Client]
    D -->|API Call| E[Backend]
    E -->|Response| D
    D -->|Data| C
    C -->|Data| B
    B -->|Cache + Return| A
    
    B -->|Cache Hit| A
    
    style B fill:#f59e0b,color:#000
    style A fill:#3b82f6,color:#fff
    style E fill:#22c55e,color:#fff
```

---

## 4. Arquitectura de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                      App Layout (Root)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Client Layout Provider                    │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         QueryClientProvider                      │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │        ThemeProvider                       │  │  │  │
│  │  │  │  ┌─────────────────────────────────────┐  │  │  │  │
│  │  │  │  │         Page Content                │  │  │  │  │
│  │  │  │  │                                     │  │  │  │  │
│  │  │  │  │  ┌──────────────┐ ┌─────────────┐  │  │  │  │  │
│  │  │  │  │  │  Components  │ │   Modals    │  │  │  │  │  │
│  │  │  │  │  └──────────────┘ └─────────────┘  │  │  │  │  │
│  │  │  │  │                                     │  │  │  │  │
│  │  │  │  │  ┌──────────────┐ ┌─────────────┐  │  │  │  │  │
│  │  │  │  │  │    Hooks     │ │   Stores    │  │  │  │  │  │
│  │  │  │  │  └──────────────┘ └─────────────┘  │  │  │  │  │
│  │  │  │  └─────────────────────────────────────┘  │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Estructura de Rutas (App Router)

```mermaid
graph TD
    Root[/ - Landing Page]
    
    Root --> Auth[/auth]
    Auth --> Login[/auth/login]
    Auth --> Register[/auth/register]
    
    Root --> Dashboard[/dashboard]
    
    Root --> Student[/student]
    Student --> Historia[/student/historia]
    Student --> Recomendaciones[/student/recomendaciones]
    Student --> Inscripciones[/student/inscripciones]
    Student --> Experiencias[/student/experiencias]
    
    Root --> Admin[/admin]
    Admin --> AdminDash[/admin/dashboard]
    Admin --> Planes[/admin/planes]
    Admin --> Stats[/admin/estadisticas]
    
    Root --> Perfil[/perfil]
    Root --> EstadisticasM[/estadisticasMateria]
    
    style Root fill:#3b82f6,color:#fff
    style Student fill:#22c55e,color:#fff
    style Admin fill:#ef4444,color:#fff
    style Auth fill:#8b5cf6,color:#fff
```

---

## 6. Flujo de Carga de Historia Académica

```mermaid
sequenceDiagram
    participant U as Usuario
    participant UI as Upload Component
    participant H as useHistoriaAcademica Hook
    participant S as historiaAcademicaService
    participant API as Spring Boot API
    participant Parser as PDF/Excel Parser
    participant DB as Database

    U->>UI: Selecciona archivo (PDF/Excel)
    UI->>UI: Valida tipo de archivo
    UI->>H: Llama a cargarHistoria()
    H->>S: cargarHistoria(userId, file)
    S->>API: POST /api/shared/historia-academica
    API->>Parser: Procesa archivo
    Parser->>Parser: Extrae datos académicos
    Parser->>DB: Guarda materias cursadas
    DB-->>API: Confirmación
    API-->>S: Historia procesada
    S-->>H: Success
    H->>H: Invalida query cache
    H-->>UI: Actualiza UI
    UI-->>U: Muestra historia cargada
```

---

## 7. Sistema de Recomendaciones

```mermaid
graph TB
    A[Usuario solicita recomendaciones] --> B[useRecomendaciones Hook]
    B --> C[recomendacionService]
    C --> D[Spring Boot API]
    
    D --> E[Obtiene Historia Académica]
    D --> F[Obtiene Planes de Estudio]
    D --> G[Obtiene Estadísticas]
    
    E --> H[Algoritmo de Recomendación]
    F --> H
    G --> H
    
    H --> I{Evalúa Criterios}
    
    I -->|Correlativas| J[Materias habilitadas]
    I -->|Vencimientos| K[Regularidades próximas a vencer]
    I -->|Dificultad| L[Estadísticas de aprobación]
    I -->|Futuro| M[Correlativas futuras]
    
    J --> N[Lista Priorizada]
    K --> N
    L --> N
    M --> N
    
    N --> O[Response al Frontend]
    O --> P[Renderiza Recomendaciones]
    
    style H fill:#f59e0b,color:#000
    style N fill:#22c55e,color:#fff
```

---

## 8. Gestión de Estado Global

```
┌──────────────────────────────────────────────────────────┐
│                    Estado de la Aplicación                │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────┐      ┌─────────────────────┐   │
│  │   Zustand Stores    │      │  TanStack Query     │   │
│  │   (Client State)    │      │  (Server State)     │   │
│  ├─────────────────────┤      ├─────────────────────┤   │
│  │                     │      │                     │   │
│  │ • modal-store       │      │ • Queries Cache     │   │
│  │   - isOpen          │      │   - estudiante      │   │
│  │   - modalType       │      │   - historia        │   │
│  │   - modalData       │      │   - inscripciones   │   │
│  │                     │      │   - experiencias    │   │
│  │ • ui-store          │      │   - estadísticas    │   │
│  │   - sidebarOpen     │      │                     │   │
│  │   - theme           │      │ • Mutations         │   │
│  │   - preferences     │      │   - crear           │   │
│  │                     │      │   - actualizar      │   │
│  └─────────────────────┘      │   - eliminar        │   │
│                               └─────────────────────┘   │
│                                                           │
│  Sincronización:                                          │
│  ┌─────────────────────────────────────────────────┐     │
│  │  Zustand ←→ LocalStorage (persistencia)         │     │
│  │  TanStack Query ←→ API (sincronización)         │     │
│  └─────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘
```

---

## 9. Arquitectura de Servicios

```
┌─────────────────────────────────────────────────────────┐
│                    Services Layer                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  estadisticasService ──┐                                │
│  experienciaService ───┤                                │
│  historiaAcademicaService ─┤                            │
│  inscripcionService ───┤   │                            │
│  materiaService ───────┤   │                            │
│  perfilService ────────┤   ├──→ axiosClient ──→ Backend │
│  personaService ───────┤   │                            │
│  planesEstudioService ─┤   │                            │
│  recomendacionService ─┘   │                            │
│                             │                            │
│  ┌──────────────────────────┘                           │
│  │                                                       │
│  └──→ Interceptors:                                     │
│       • Request: Inyecta JWT token                      │
│       • Response: Maneja errores globales               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 10. Ciclo de Vida de una Query

```mermaid
stateDiagram-v2
    [*] --> Idle: Component Mount
    Idle --> Fetching: Query Triggered
    Fetching --> Success: Data Received
    Fetching --> Error: Request Failed
    
    Success --> Stale: staleTime Expired
    Stale --> Fetching: Refetch Triggered
    
    Success --> Fresh: Within staleTime
    Fresh --> Stale: Time Passes
    
    Error --> Idle: Reset
    Error --> Fetching: Retry
    
    Success --> [*]: Component Unmount
    Error --> [*]: Component Unmount
    
    note right of Success
        Data en cache
        UI actualizada
    end note
    
    note right of Stale
        Data disponible
        Refetch en background
    end note
```

---

## 11. Flujo de Inscripción a Mesa de Examen

```mermaid
sequenceDiagram
    participant E as Estudiante
    participant UI as Inscripciones Page
    participant Hook as useInscripciones
    participant Service as inscripcionService
    participant API as Backend API
    participant DB as Database

    E->>UI: Ve mesas disponibles
    UI->>Hook: useObtenerMateriasInscripcion()
    Hook->>Service: obtenerMateriasParaInscripcion()
    Service->>API: GET /api/shared/finales
    API->>DB: Query materias habilitadas
    DB-->>API: Lista de materias
    API-->>Service: Materias disponibles
    Service-->>Hook: Data
    Hook-->>UI: Renderiza mesas

    E->>UI: Selecciona mesa y se inscribe
    UI->>Hook: inscribirseAMesa(data)
    Hook->>Service: inscribirseAMesa(data)
    Service->>API: POST /api/shared/inscripciones
    API->>DB: Crea inscripción
    DB-->>API: Confirmación
    API-->>Service: Inscripción creada
    Service-->>Hook: Success
    Hook->>Hook: Invalida cache
    Hook-->>UI: Actualiza UI
    UI-->>E: Confirmación visual
```

---

## 12. Arquitectura de Componentes UI

```
┌─────────────────────────────────────────────────────┐
│              Componentes de UI (Jerarquía)          │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Nivel 1: Primitivos (Radix UI)                     │
│  ┌────────────────────────────────────────────┐    │
│  │ Dialog, Dropdown, Select, Checkbox, etc.   │    │
│  └────────────────────────────────────────────┘    │
│                      ↓                               │
│  Nivel 2: Componentes Base (ShadCN)                 │
│  ┌────────────────────────────────────────────┐    │
│  │ Button, Card, Input, Label, Toast, etc.    │    │
│  └────────────────────────────────────────────┘    │
│                      ↓                               │
│  Nivel 3: Componentes Compartidos                   │
│  ┌────────────────────────────────────────────┐    │
│  │ Skeleton, ModeToggle, ThemeProvider        │    │
│  └────────────────────────────────────────────┘    │
│                      ↓                               │
│  Nivel 4: Componentes de Dominio                    │
│  ┌────────────────────────────────────────────┐    │
│  │ ExperienciaCard, HistoriaTable,            │    │
│  │ RecomendacionCard, InscripcionCard         │    │
│  └────────────────────────────────────────────┘    │
│                      ↓                               │
│  Nivel 5: Páginas                                    │
│  ┌────────────────────────────────────────────┐    │
│  │ StudentPage, AdminPage, DashboardPage      │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 13. Diagrama de Deployment

```
┌──────────────────────────────────────────────────────┐
│                    Vercel Edge Network                │
│  ┌────────────────────────────────────────────────┐  │
│  │         Next.js Application (SSR + SSG)        │  │
│  │                                                 │  │
│  │  • Static Assets (CDN)                         │  │
│  │  • Serverless Functions                        │  │
│  │  • Edge Functions                              │  │
│  │  • Automatic HTTPS                             │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌──────────────────────────────────────────────────────┐
│                  Backend Services                     │
│                                                       │
│  ┌─────────────────────┐    ┌──────────────────┐    │
│  │   Render.com        │    │    Supabase      │    │
│  │                     │    │                  │    │
│  │ • Spring Boot API   │    │ • Auth Service   │    │
│  │ • PostgreSQL DB     │    │ • PostgreSQL DB  │    │
│  │ • Auto-deploy       │    │ • Storage        │    │
│  └─────────────────────┘    └──────────────────┘    │
└──────────────────────────────────────────────────────┘
```

---

## Leyenda de Colores (Mermaid)

- 🔵 **Azul**: Frontend / Cliente
- 🟢 **Verde**: Backend / API
- 🟣 **Púrpura**: Autenticación / Seguridad
- 🟡 **Amarillo**: Cache / Estado
- 🔴 **Rojo**: Administración

---

## Notas Técnicas

### Diagramas Mermaid
Los diagramas en formato Mermaid pueden ser renderizados en:
- GitHub (automáticamente)
- GitLab
- Editores como VS Code (con extensión)
- Herramientas online: [Mermaid Live Editor](https://mermaid.live/)

### Actualización de Diagramas
Los diagramas deben actualizarse cuando:
- Se agreguen nuevos módulos o servicios
- Cambien flujos de datos importantes
- Se modifique la arquitectura general

---

**Próximo**: [Guía de Desarrollo →](./12-guia-desarrollo.md)
