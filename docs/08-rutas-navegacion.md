# 🛣️ Rutas y Navegación

## Visión General

El proyecto utiliza el **App Router** de Next.js 16, que proporciona routing basado en el sistema de archivos con soporte para layouts, loading states, y error boundaries.

---

## Estructura de Rutas

```
app/
├── page.tsx                    # / (Landing page)
├── layout.tsx                  # Root layout
├── globals.css                 # Estilos globales
│
├── auth/                       # /auth/*
│   ├── login/
│   │   └── page.tsx           # /auth/login
│   └── register/
│       └── page.tsx           # /auth/register
│
├── dashboard/                  # /dashboard
│   ├── layout.tsx
│   └── page.tsx
│
├── student/                    # /student/*
│   ├── layout.tsx             # Layout compartido
│   ├── historia/
│   │   └── page.tsx           # /student/historia
│   ├── recomendaciones/
│   │   └── page.tsx           # /student/recomendaciones
│   ├── inscripciones/
│   │   └── page.tsx           # /student/inscripciones
│   └── experiencias/
│       └── page.tsx           # /student/experiencias
│
├── admin/                      # /admin/*
│   ├── layout.tsx             # Layout de admin
│   ├── page.tsx               # /admin (Dashboard)
│   ├── dashboard/
│   │   └── page.tsx           # /admin/dashboard
│   ├── planes/
│   │   └── page.tsx           # /admin/planes
│   └── estadisticas/
│       └── page.tsx           # /admin/estadisticas
│
├── perfil/                     # /perfil
│   └── page.tsx
│
├── estadisticasMateria/        # /estadisticasMateria
│   └── page.tsx
│
├── reset-password/             # /reset-password
│   └── page.tsx
│
├── politica-privacidad/        # /politica-privacidad
│   └── page.tsx
│
└── terminos-condiciones/       # /terminos-condiciones
    └── page.tsx
```

---

## Tipos de Rutas

### Rutas Públicas

Accesibles sin autenticación:

- `/` - Landing page
- `/auth/login` - Login
- `/auth/register` - Registro
- `/politica-privacidad` - Política de privacidad
- `/terminos-condiciones` - Términos y condiciones

### Rutas Privadas

Requieren autenticación:

- `/dashboard` - Dashboard general
- `/perfil` - Perfil de usuario
- `/student/*` - Módulo de estudiantes
- `/admin/*` - Módulo de administración (requiere rol ADMIN)
- `/estadisticasMateria` - Estadísticas de materia

---

## Protección de Rutas

### Middleware de Autenticación

Las rutas protegidas verifican la sesión antes de renderizar:

```typescript
// app/student/historia/page.tsx
import { redirect } from 'next/navigation';
import { supabase } from '@/supabaseClient';

export default async function HistoriaPage() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/login');
  }
  
  return <HistoriaContent />;
}
```

### Protección por Rol

```typescript
// app/admin/page.tsx
import { redirect } from 'next/navigation';
import { supabase } from '@/supabaseClient';

export default async function AdminPage() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/login');
  }
  
  const user = session.user;
  const rol = user.user_metadata?.rol;
  
  if (rol !== 'ADMINISTRADOR') {
    redirect('/dashboard');
  }
  
  return <AdminContent />;
}
```

### Hook de Protección

```typescript
// hooks/useProtectedRoute.ts
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/supabaseClient';

export const useProtectedRoute = (requiredRole?: string) => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/login');
        return;
      }
      
      if (requiredRole) {
        const userRole = session.user.user_metadata?.rol;
        if (userRole !== requiredRole) {
          router.push('/dashboard');
        }
      }
    };

    checkAuth();
  }, [router, requiredRole]);
};
```

**Uso**:

```typescript
'use client';

import { useProtectedRoute } from '@/hooks/useProtectedRoute';

export default function AdminPage() {
  useProtectedRoute('ADMINISTRADOR');
  
  return <div>Contenido de admin</div>;
}
```

---

## Layouts

### Root Layout

**Ubicación**: `app/layout.tsx`

Layout principal de la aplicación:

```typescript
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { ClientLayout } from '@/components/layout/client-layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Asistente Virtual',
  description: 'Soporte académico virtual para estudiantes de la UNSL.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen`}>
        <ClientLayout>{children}</ClientLayout>
        <Analytics />
      </body>
    </html>
  );
}
```

### Student Layout

**Ubicación**: `app/student/layout.tsx`

Layout compartido para el módulo de estudiantes:

```typescript
import { Sidebar } from '@/components/student/Sidebar';
import { Header } from '@/components/student/Header';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Admin Layout

**Ubicación**: `app/admin/layout.tsx`

Layout compartido para el módulo de administración:

```typescript
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## Navegación

### Link Component

```typescript
import Link from 'next/link';

// Navegación básica
<Link href="/student/historia">
  Historia Académica
</Link>

// Con className
<Link 
  href="/student/recomendaciones"
  className="text-blue-600 hover:underline"
>
  Ver Recomendaciones
</Link>

// Prefetch deshabilitado
<Link href="/admin/estadisticas" prefetch={false}>
  Estadísticas
</Link>
```

### useRouter Hook

```typescript
'use client';

import { useRouter } from 'next/navigation';

function Component() {
  const router = useRouter();
  
  const handleNavigate = () => {
    router.push('/student/historia');
  };
  
  const handleBack = () => {
    router.back();
  };
  
  const handleRefresh = () => {
    router.refresh();
  };
  
  return (
    <div>
      <button onClick={handleNavigate}>Ir a Historia</button>
      <button onClick={handleBack}>Volver</button>
      <button onClick={handleRefresh}>Refrescar</button>
    </div>
  );
}
```

### usePathname Hook

```typescript
'use client';

import { usePathname } from 'next/navigation';

function Navigation() {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname === path;
  
  return (
    <nav>
      <Link 
        href="/student/historia"
        className={isActive('/student/historia') ? 'active' : ''}
      >
        Historia
      </Link>
      <Link 
        href="/student/recomendaciones"
        className={isActive('/student/recomendaciones') ? 'active' : ''}
      >
        Recomendaciones
      </Link>
    </nav>
  );
}
```

### useSearchParams Hook

```typescript
'use client';

import { useSearchParams } from 'next/navigation';

function SearchComponent() {
  const searchParams = useSearchParams();
  
  const query = searchParams.get('q');
  const page = searchParams.get('page') || '1';
  
  return (
    <div>
      <p>Búsqueda: {query}</p>
      <p>Página: {page}</p>
    </div>
  );
}
```

---

## Rutas Dinámicas

### Parámetros de Ruta

```typescript
// app/student/materia/[id]/page.tsx
interface PageProps {
  params: {
    id: string;
  };
}

export default function MateriaPage({ params }: PageProps) {
  const { id } = params;
  
  return <div>Materia ID: {id}</div>;
}
```

### Múltiples Parámetros

```typescript
// app/admin/carrera/[planId]/materia/[materiaId]/page.tsx
interface PageProps {
  params: {
    planId: string;
    materiaId: string;
  };
}

export default function MateriaDetailPage({ params }: PageProps) {
  const { planId, materiaId } = params;
  
  return (
    <div>
      <p>Plan: {planId}</p>
      <p>Materia: {materiaId}</p>
    </div>
  );
}
```

### Catch-all Routes

```typescript
// app/docs/[...slug]/page.tsx
interface PageProps {
  params: {
    slug: string[];
  };
}

export default function DocsPage({ params }: PageProps) {
  const { slug } = params;
  // slug = ['getting-started', 'installation']
  
  return <div>Path: {slug.join('/')}</div>;
}
```

---

## Loading States

```typescript
// app/student/historia/loading.tsx
export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
```

---

## Error Handling

```typescript
// app/student/historia/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h2 className="text-2xl font-bold mb-4">Algo salió mal</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
```

---

## Metadata

### Metadata Estática

```typescript
// app/student/historia/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Historia Académica | Asistente Virtual',
  description: 'Consulta tu historia académica completa',
};

export default function HistoriaPage() {
  return <div>Historia Académica</div>;
}
```

### Metadata Dinámica

```typescript
// app/student/materia/[id]/page.tsx
import type { Metadata } from 'next';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const materia = await fetchMateria(params.id);
  
  return {
    title: `${materia.nombre} | Asistente Virtual`,
    description: `Información sobre ${materia.nombre}`,
  };
}

export default function MateriaPage({ params }: PageProps) {
  return <div>Materia</div>;
}
```

---

## Redirects

### Redirect en Server Component

```typescript
import { redirect } from 'next/navigation';

export default async function Page() {
  const session = await getSession();
  
  if (!session) {
    redirect('/auth/login');
  }
  
  return <div>Contenido</div>;
}
```

### Redirect en Client Component

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const router = useRouter();
  
  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (!session) {
        router.push('/auth/login');
      }
    };
    
    checkAuth();
  }, [router]);
  
  return <div>Contenido</div>;
}
```

---

## Parallel Routes

```typescript
// app/dashboard/@analytics/page.tsx
export default function Analytics() {
  return <div>Analytics Panel</div>;
}

// app/dashboard/@activity/page.tsx
export default function Activity() {
  return <div>Activity Feed</div>;
}

// app/dashboard/layout.tsx
export default function Layout({
  children,
  analytics,
  activity,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  activity: React.ReactNode;
}) {
  return (
    <div>
      {children}
      <div className="grid grid-cols-2 gap-4">
        {analytics}
        {activity}
      </div>
    </div>
  );
}
```

---

## Mejores Prácticas

### 1. Usar Server Components por Defecto

```typescript
// ✅ Server Component (por defecto)
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Solo usar 'use client' cuando sea necesario
'use client';
export default function InteractivePage() {
  const [state, setState] = useState();
  return <div>{state}</div>;
}
```

### 2. Prefetch Estratégico

```typescript
// Prefetch automático para links visibles
<Link href="/student/historia">Historia</Link>

// Desactivar prefetch para rutas pesadas
<Link href="/admin/estadisticas" prefetch={false}>
  Estadísticas
</Link>
```

### 3. Loading States Granulares

```typescript
// loading.tsx en cada nivel de ruta
app/
├── student/
│   ├── loading.tsx          # Loading para /student
│   └── historia/
│       └── loading.tsx      # Loading para /student/historia
```

---

**Próximo**: [Hooks Personalizados →](./09-hooks.md)
