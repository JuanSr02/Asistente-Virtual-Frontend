# ⚡ Performance y Optimización

## Visión General

El proyecto implementa múltiples estrategias de optimización para garantizar una experiencia de usuario rápida y fluida.

---

## Métricas de Performance

### Core Web Vitals

**Objetivos**:

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **TTFB (Time to First Byte)**: < 600ms

**Lighthouse Score Objetivo**: 90+

---

## Optimizaciones de Next.js

### 1. Image Optimization

```typescript
import Image from 'next/image';

// ✅ Optimizado automáticamente
<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority // Para imágenes above the fold
  placeholder="blur" // Blur placeholder
  blurDataURL="data:image/..." // Base64 blur
/>

// ❌ No optimizado
<img src="/logo.png" alt="Logo" />
```

**Beneficios**:

- Lazy loading automático
- Responsive images
- WebP/AVIF automático
- Optimización de tamaño

---

### 2. Font Optimization

```typescript
import { Inter, Roboto } from 'next/font/google';

// Fuente optimizada
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export default function RootLayout({ children }) {
  return (
    <html>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
```

**Beneficios**:

- Self-hosting automático
- Zero layout shift
- Preload automático

---

### 3. Code Splitting

#### Automatic Code Splitting

Next.js divide automáticamente el código por rutas.

#### Dynamic Imports

```typescript
import dynamic from 'next/dynamic';

// Lazy load de componente pesado
const HeavyChart = dynamic(
  () => import('@/components/charts/HeavyChart'),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
    ssr: false, // Desactivar SSR si no es necesario
  }
);

// Con named export
const AdminPanel = dynamic(
  () => import('@/components/admin/AdminPanel').then(
    (mod) => mod.AdminPanel
  ),
  { ssr: false }
);
```

---

### 4. Server Components

```typescript
// ✅ Server Component (por defecto)
// Renderizado en servidor, no envía JS al cliente
export default async function Page() {
  const data = await fetchData();

  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
    </div>
  );
}

// Client Component (solo cuando sea necesario)
'use client';

export default function InteractivePage() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

**Beneficios**:

- Menos JavaScript al cliente
- Mejor performance inicial
- SEO mejorado

---

## Optimizaciones de React

### 1. Memoization

#### React.memo

```typescript
import { memo } from 'react';

// Memoizar componente costoso
export const ExpensiveComponent = memo(({ data }) => {
  // Renderizado costoso
  return <div>{/* ... */}</div>;
});

// Con comparación personalizada
export const CustomMemoComponent = memo(
  ({ user }) => <div>{user.name}</div>,
  (prevProps, nextProps) => {
    return prevProps.user.id === nextProps.user.id;
  }
);
```

#### useMemo

```typescript
import { useMemo } from 'react';

function Component({ items }) {
  // Memoizar cálculo costoso
  const sortedItems = useMemo(() => {
    return items.sort((a, b) => a.value - b.value);
  }, [items]);

  // Memoizar objeto/array
  const config = useMemo(() => ({
    theme: 'dark',
    locale: 'es',
  }), []);

  return <div>{/* ... */}</div>;
}
```

#### useCallback

```typescript
import { useCallback } from 'react';

function Component() {
  // Memoizar función
  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);

  // Con dependencias
  const handleSubmit = useCallback((data) => {
    submitData(data);
  }, [submitData]);

  return <Button onClick={handleClick}>Click</Button>;
}
```

---

### 2. Lazy Loading

```typescript
import { lazy, Suspense } from 'react';

// Lazy load de componente
const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<Skeleton />}>
      <LazyComponent />
    </Suspense>
  );
}
```

---

### 3. Virtualization

Para listas largas, usar virtualización:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Optimizaciones de TanStack Query

### 1. Stale Time

```typescript
const { data } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
  staleTime: 5 * 60 * 1000, // 5 minutos
});
```

### 2. Cache Time

```typescript
const { data } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
  cacheTime: 10 * 60 * 1000, // 10 minutos
});
```

### 3. Prefetching

```typescript
const queryClient = useQueryClient();

// Prefetch en hover
const handleMouseEnter = () => {
  queryClient.prefetchQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
};

<Link
  href="/user/123"
  onMouseEnter={handleMouseEnter}
>
  Ver Usuario
</Link>
```

### 4. Select

```typescript
// Solo seleccionar datos necesarios
const { data: userName } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
  select: (user) => user.name, // Solo retorna el nombre
});
```

---

## Optimizaciones de Bundle

### 1. Tree Shaking

```typescript
// ✅ Bueno - importar solo lo necesario
import { Button } from "@/components/ui/button";

// ❌ Malo - importar todo
import * as UI from "@/components/ui";
```

### 2. Package Optimization

```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizePackageImports: [
      "@supabase/supabase-js",
      "lucide-react",
      "recharts",
    ],
  },
};
```

### 3. Bundle Analyzer

```bash
# Analizar tamaño de bundles
pnpm analyze
```

---

## Optimizaciones de Red

### 1. Compression

Vercel habilita automáticamente:

- Gzip
- Brotli

### 2. Caching Headers

```typescript
// app/api/data/route.ts
export async function GET() {
  return new Response(JSON.stringify(data), {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
```

### 3. CDN

Vercel Edge Network:

- Distribución global
- Cache en edge
- Latencia reducida

---

## Optimizaciones de CSS

### 1. Tailwind Purge

```javascript
// tailwind.config.ts
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  // Solo incluye clases usadas
};
```

### 2. CSS Minification

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    cssnano: {
      preset: "default",
    },
  },
};
```

---

## Optimizaciones de JavaScript

### 1. Minification

Next.js minifica automáticamente en producción.

### 2. Compression

```javascript
// next.config.js
module.exports = {
  compress: true, // Habilita gzip
};
```

---

## Optimizaciones de Rendering

### 1. Debouncing

```typescript
import { useDebouncedCallback } from 'use-debounce';

function SearchInput() {
  const debouncedSearch = useDebouncedCallback(
    (value) => {
      performSearch(value);
    },
    500 // 500ms delay
  );

  return (
    <input
      onChange={(e) => debouncedSearch(e.target.value)}
      placeholder="Buscar..."
    />
  );
}
```

### 2. Throttling

```typescript
import { useThrottledCallback } from 'use-debounce';

function ScrollComponent() {
  const throttledScroll = useThrottledCallback(
    () => {
      handleScroll();
    },
    200 // Máximo cada 200ms
  );

  return (
    <div onScroll={throttledScroll}>
      {/* Contenido */}
    </div>
  );
}
```

---

## Optimizaciones de Base de Datos

### 1. Indexing

Asegurar índices en Supabase:

- Campos de búsqueda frecuente
- Foreign keys
- Campos de ordenamiento

### 2. Query Optimization

```typescript
// ✅ Bueno - select específico
const { data } = await supabase
  .from("estudiantes")
  .select("id, nombre, email")
  .eq("id", userId)
  .single();

// ❌ Malo - select *
const { data } = await supabase
  .from("estudiantes")
  .select("*")
  .eq("id", userId);
```

### 3. Pagination

```typescript
const { data } = await supabase
  .from("experiencias")
  .select("*")
  .range(0, 9) // Primeros 10 resultados
  .order("created_at", { ascending: false });
```

---

## Monitoring

### 1. Vercel Analytics

```typescript
import { Analytics } from '@vercel/analytics/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Performance API

```typescript
// Medir performance
const startTime = performance.now();
await fetchData();
const endTime = performance.now();
console.log(`Fetch took ${endTime - startTime}ms`);
```

### 3. Web Vitals

```typescript
// app/layout.tsx
export function reportWebVitals(metric) {
  console.log(metric);
  // Enviar a analytics
}
```

---

## Checklist de Performance

### Build Time

- [ ] Bundle size < 500KB (gzipped)
- [ ] No dependencias innecesarias
- [ ] Tree shaking habilitado
- [ ] Code splitting implementado

### Runtime

- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Images optimizadas
- [ ] Fonts optimizadas

### Network

- [ ] Compression habilitada
- [ ] CDN configurado
- [ ] Caching headers correctos
- [ ] Prefetching estratégico

### React

- [ ] Memoization donde corresponde
- [ ] Lazy loading de componentes pesados
- [ ] Server Components por defecto
- [ ] Virtualization para listas largas

---

## Herramientas de Análisis

### Lighthouse

```bash
# Chrome DevTools > Lighthouse
# Generar reporte de performance
```

### Bundle Analyzer

```bash
pnpm analyze
```

### React DevTools Profiler

- Identificar renders innecesarios
- Medir tiempo de renderizado
- Optimizar componentes lentos

---

**Próximo**: [Troubleshooting →](./15-troubleshooting.md)
