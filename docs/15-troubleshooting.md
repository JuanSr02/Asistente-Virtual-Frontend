# 🔧 Troubleshooting

## Visión General

Guía de solución de problemas comunes en el desarrollo y deployment del proyecto.

---

## Problemas de Instalación

### Error: "pnpm: command not found"

**Problema**: pnpm no está instalado.

**Solución**:

```bash
# Instalar pnpm globalmente
npm install -g pnpm

# Verificar instalación
pnpm --version
```

---

### Error: "Node version mismatch"

**Problema**: Versión de Node.js incorrecta.

**Solución**:

```bash
# Verificar versión requerida en package.json
# "engines": { "node": ">=18.0.0" }

# Instalar versión correcta con nvm
nvm install 18
nvm use 18

# Verificar
node --version
```

---

### Error: "Module not found"

**Problema**: Dependencias no instaladas o corruptas.

**Solución**:

```bash
# Limpiar e reinstalar
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install

# Si persiste, limpiar cache
pnpm store prune
pnpm install
```

---

## Problemas de Desarrollo

### Error: "Port 3000 already in use"

**Problema**: Puerto ocupado por otro proceso.

**Solución**:

```bash
# Opción 1: Usar otro puerto
PORT=3001 pnpm dev

# Opción 2: Matar proceso en puerto 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Opción 3: Matar proceso (Linux/Mac)
lsof -ti:3000 | xargs kill -9
```

---

### Error: "Hydration mismatch"

**Problema**: Diferencia entre renderizado servidor/cliente.

**Causas comunes**:
- Usar `window` o `document` en Server Component
- Fechas sin formato consistente
- Random values sin seed

**Solución**:

```typescript
// ❌ Malo
export default function Component() {
  const randomValue = Math.random(); // Diferente en servidor/cliente
  return <div>{randomValue}</div>;
}

// ✅ Bueno - usar 'use client'
'use client';

export default function Component() {
  const [randomValue, setRandomValue] = useState(0);
  
  useEffect(() => {
    setRandomValue(Math.random());
  }, []);
  
  return <div>{randomValue}</div>;
}

// ✅ Bueno - suppressHydrationWarning
<div suppressHydrationWarning>
  {new Date().toLocaleDateString()}
</div>
```

---

### Error: "Cannot read property of undefined"

**Problema**: Acceso a propiedad de objeto undefined.

**Solución**:

```typescript
// ❌ Malo
const userName = user.name;

// ✅ Bueno - optional chaining
const userName = user?.name;

// ✅ Bueno - con default
const userName = user?.name ?? 'Invitado';

// ✅ Bueno - verificar antes
if (user && user.name) {
  const userName = user.name;
}
```

---

### Error: "Maximum update depth exceeded"

**Problema**: Loop infinito de renders.

**Causas comunes**:
- setState en render
- useEffect sin dependencias correctas

**Solución**:

```typescript
// ❌ Malo
function Component() {
  const [count, setCount] = useState(0);
  setCount(count + 1); // Loop infinito!
  return <div>{count}</div>;
}

// ✅ Bueno
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    setCount(count + 1);
  }, []); // Solo una vez
  
  return <div>{count}</div>;
}

// ❌ Malo - dependencias incorrectas
useEffect(() => {
  setData(fetchData());
}, [data]); // Loop infinito!

// ✅ Bueno
useEffect(() => {
  const loadData = async () => {
    const result = await fetchData();
    setData(result);
  };
  loadData();
}, []); // Solo al montar
```

---

## Problemas de TypeScript

### Error: "Type 'X' is not assignable to type 'Y'"

**Problema**: Tipos incompatibles.

**Solución**:

```typescript
// ❌ Malo
const age: string = 25;

// ✅ Bueno
const age: number = 25;

// Para tipos complejos
interface User {
  id: string;
  name: string;
  age: number;
}

const user: User = {
  id: '123',
  name: 'Juan',
  age: 25,
};

// Type assertion (usar con cuidado)
const data = response.data as User;
```

---

### Error: "Property 'X' does not exist on type 'Y'"

**Problema**: Propiedad no definida en tipo.

**Solución**:

```typescript
// ❌ Malo
const user: any = { name: 'Juan' };
console.log(user.age); // No error, pero undefined

// ✅ Bueno - definir tipo completo
interface User {
  name: string;
  age?: number; // Opcional
}

const user: User = { name: 'Juan' };
console.log(user.age); // TypeScript sabe que puede ser undefined

// ✅ Bueno - extender tipo
interface ExtendedUser extends User {
  email: string;
}
```

---

## Problemas de Autenticación

### Error: "Session expired"

**Problema**: Token JWT expirado.

**Solución**:

```typescript
// Verificar en axios interceptor
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refrescar token
      const { data } = await supabase.auth.refreshSession();
      
      if (data.session) {
        // Reintentar request
        error.config.headers.Authorization = 
          `Bearer ${data.session.access_token}`;
        return axiosClient.request(error.config);
      } else {
        // Redirigir a login
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);
```

---

### Error: "Invalid credentials"

**Problema**: Credenciales incorrectas.

**Solución**:

```typescript
// Verificar formato de email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  toast({
    title: 'Error',
    description: 'Email inválido',
    variant: 'destructive',
  });
  return;
}

// Verificar longitud de contraseña
if (password.length < 6) {
  toast({
    title: 'Error',
    description: 'La contraseña debe tener al menos 6 caracteres',
    variant: 'destructive',
  });
  return;
}
```

---

## Problemas de TanStack Query

### Error: "Query data is undefined"

**Problema**: Query aún no ha cargado.

**Solución**:

```typescript
const { data, isLoading, isError } = useQuery({
  queryKey: ['user'],
  queryFn: fetchUser,
});

// ✅ Manejar estados correctamente
if (isLoading) return <Skeleton />;
if (isError) return <Error />;
if (!data) return <Empty />;

return <UserDisplay user={data} />;
```

---

### Error: "Query is not enabled"

**Problema**: Query deshabilitada por condición.

**Solución**:

```typescript
// ❌ Malo - query siempre intenta ejecutar
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
});

// ✅ Bueno - solo ejecutar si userId existe
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId, // Solo si userId tiene valor
});
```

---

### Problema: "Stale data"

**Problema**: Datos desactualizados en cache.

**Solución**:

```typescript
// Opción 1: Reducir staleTime
const { data } = useQuery({
  queryKey: ['user'],
  queryFn: fetchUser,
  staleTime: 0, // Siempre refetch
});

// Opción 2: Invalidar manualmente
const queryClient = useQueryClient();
queryClient.invalidateQueries(['user']);

// Opción 3: Refetch manual
const { data, refetch } = useQuery({
  queryKey: ['user'],
  queryFn: fetchUser,
});

<Button onClick={() => refetch()}>Actualizar</Button>
```

---

## Problemas de Supabase

### Error: "Invalid API key"

**Problema**: Clave de API incorrecta o no configurada.

**Solución**:

```bash
# Verificar .env.local
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key

# Reiniciar servidor de desarrollo
pnpm dev
```

---

### Error: "Row Level Security policy violation"

**Problema**: Políticas RLS bloquean acceso.

**Solución**:

```sql
-- Verificar políticas en Supabase Dashboard
-- SQL Editor

-- Ejemplo: Permitir lectura a usuarios autenticados
CREATE POLICY "Allow authenticated read"
ON public.estudiantes
FOR SELECT
TO authenticated
USING (true);

-- Ejemplo: Permitir escritura solo al dueño
CREATE POLICY "Allow owner write"
ON public.experiencias
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = estudiante_id);
```

---

## Problemas de Build

### Error: "Build failed"

**Problema**: Error en build de producción.

**Solución**:

```bash
# 1. Verificar errores de TypeScript
pnpm type-check

# 2. Verificar errores de ESLint
pnpm lint

# 3. Limpiar cache
rm -rf .next
pnpm build

# 4. Verificar logs detallados
pnpm build --debug
```

---

### Error: "Out of memory"

**Problema**: Build se queda sin memoria.

**Solución**:

```bash
# Aumentar límite de memoria de Node.js
NODE_OPTIONS="--max-old-space-size=4096" pnpm build

# En package.json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

---

## Problemas de Deployment

### Error: "Deployment failed on Vercel"

**Problema**: Deploy falla en Vercel.

**Solución**:

```bash
# 1. Verificar build local
pnpm build

# 2. Verificar variables de entorno en Vercel
# Dashboard > Settings > Environment Variables

# 3. Verificar logs en Vercel
# Dashboard > Deployments > [deployment] > Build Logs

# 4. Verificar versión de Node.js
# package.json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

### Error: "Environment variables not found"

**Problema**: Variables de entorno no configuradas en Vercel.

**Solución**:

1. Ir a Vercel Dashboard
2. Project Settings → Environment Variables
3. Agregar variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Redeploy

---

## Problemas de Performance

### Problema: "Slow page load"

**Solución**:

```typescript
// 1. Lazy load componentes pesados
const HeavyComponent = dynamic(
  () => import('./HeavyComponent'),
  { ssr: false }
);

// 2. Optimizar imágenes
<Image
  src="/large-image.jpg"
  alt="Image"
  width={800}
  height={600}
  priority={false}
  loading="lazy"
/>

// 3. Reducir bundle size
pnpm analyze
```

---

### Problema: "Too many re-renders"

**Solución**:

```typescript
// ❌ Malo - crea nueva función en cada render
<Button onClick={() => handleClick()}>Click</Button>

// ✅ Bueno - función memoizada
const handleClick = useCallback(() => {
  // ...
}, []);

<Button onClick={handleClick}>Click</Button>

// ✅ Bueno - memoizar componente
const MemoizedComponent = memo(Component);
```

---

## Problemas de CSS/Tailwind

### Problema: "Styles not applying"

**Solución**:

```typescript
// 1. Verificar que globals.css esté importado
// app/layout.tsx
import './globals.css';

// 2. Verificar purge en tailwind.config.ts
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
};

// 3. Limpiar cache
rm -rf .next
pnpm dev
```

---

### Problema: "Dark mode not working"

**Solución**:

```typescript
// 1. Verificar ThemeProvider
<ThemeProvider attribute="class" defaultTheme="system">
  {children}
</ThemeProvider>

// 2. Verificar tailwind.config.ts
module.exports = {
  darkMode: ['class'],
};

// 3. Verificar suppressHydrationWarning en html
<html suppressHydrationWarning>
```

---

## Debugging Tips

### Console Logging

```typescript
// Solo en desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('Debug:', data);
}

// Con contexto
console.log('User data:', { userId, userName, userEmail });

// Con trace
console.trace('Function called from:');
```

---

### React DevTools

1. Instalar extensión de navegador
2. Inspeccionar componentes
3. Ver props y estado
4. Profiler para performance

---

### Network Tab

1. Abrir DevTools → Network
2. Verificar requests
3. Ver tiempos de respuesta
4. Inspeccionar headers

---

## Recursos de Ayuda

### Documentación Oficial

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Supabase Docs](https://supabase.com/docs)

### Comunidad

- [Next.js Discord](https://discord.gg/nextjs)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)
- [GitHub Issues](https://github.com/vercel/next.js/issues)

---

## Contacto

Si el problema persiste:

**Desarrollador**: Juan Sánchez  
**Email**: juanma2002123@gmail.com  
**GitHub**: [@JuanSr02](https://github.com/JuanSr02)

---

**Volver a**: [Índice Principal →](./README.md)
