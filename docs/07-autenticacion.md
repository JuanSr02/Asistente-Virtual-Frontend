# 🔐 Autenticación y Autorización

## Visión General

El sistema de autenticación está construido sobre **Supabase Auth**, que proporciona una solución robusta y segura para la gestión de usuarios, sesiones y permisos.

---

## Arquitectura de Autenticación

```
┌─────────────────────────────────────────────────────────┐
│                  Flujo de Autenticación                  │
└─────────────────────────────────────────────────────────┘

Usuario → Login Form → Supabase Auth → JWT Token
                            ↓
                    Session Storage
                            ↓
                    Axios Interceptor
                            ↓
                    API Requests (Authenticated)
```

---

## Métodos de Autenticación Soportados

### 1. **Email/Password**
- Registro con email y contraseña
- Confirmación de email (opcional)
- Login tradicional

### 2. **Google OAuth**
- Autenticación con cuenta de Google
- Flujo OAuth 2.0
- Datos de perfil automáticos

### 3. **Reset de Contraseña**
- Solicitud de reset por email
- Token de recuperación seguro
- Actualización de contraseña

---

## Configuración de Supabase

### Cliente de Supabase

**Ubicación**: `src/supabaseClient.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Variables de Entorno Requeridas

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

---

## Flujos de Autenticación

### Registro de Usuario

```typescript
// Ejemplo de registro
const { data, error } = await supabase.auth.signUp({
  email: 'usuario@example.com',
  password: 'password123',
  options: {
    data: {
      nombre: 'Juan',
      apellido: 'Pérez',
      rol: 'ESTUDIANTE'
    }
  }
});
```

### Login

```typescript
// Login con email/password
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'usuario@example.com',
  password: 'password123'
});

// Login con Google OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
});
```

### Logout

```typescript
const { error } = await supabase.auth.signOut();
```

### Reset de Contraseña

```typescript
// Solicitar reset
const { error } = await supabase.auth.resetPasswordForEmail(
  'usuario@example.com',
  {
    redirectTo: `${window.location.origin}/reset-password`
  }
);

// Actualizar contraseña
const { error } = await supabase.auth.updateUser({
  password: 'nueva-password'
});
```

---

## Gestión de Sesiones

### Obtener Sesión Actual

```typescript
const { data: { session } } = await supabase.auth.getSession();

if (session) {
  const user = session.user;
  const token = session.access_token;
}
```

### Escuchar Cambios de Autenticación

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('Usuario autenticado', session);
  }
  if (event === 'SIGNED_OUT') {
    console.log('Usuario cerró sesión');
  }
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token renovado', session);
  }
});
```

### Auto-refresh de Tokens

Supabase maneja automáticamente la renovación de tokens:
- **Access Token**: Válido por 1 hora
- **Refresh Token**: Válido por 30 días
- **Auto-refresh**: Automático antes de expiración

---

## Integración con Axios

### Interceptor de Request

**Ubicación**: `src/lib/axios-client.ts`

```typescript
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Obtener sesión fresca (auto-refresh si es necesario)
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    } catch (error) {
      console.error('Error inyectando token:', error);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);
```

### Interceptor de Response

```typescript
axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn('Sesión expirada o token inválido');
      // Redirigir a login si es necesario
    }
    return Promise.reject(error);
  }
);
```

---

## Sistema de Roles

### Roles Disponibles

1. **ESTUDIANTE**: Usuario estudiante estándar
2. **ADMINISTRADOR**: Usuario con permisos administrativos

### Almacenamiento de Rol

El rol se almacena en:
- **Supabase Auth Metadata**: `user.user_metadata.rol`
- **Base de Datos**: Tabla `personas` o `estudiantes`

### Hook de Rol de Usuario

**Ubicación**: `src/hooks/useUserRole.ts`

```typescript
export const useUserRole = () => {
  const [role, setRole] = useState<'ESTUDIANTE' | 'ADMINISTRADOR' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const userRole = user.user_metadata?.rol || 'ESTUDIANTE';
        setRole(userRole);
      }
      
      setLoading(false);
    };

    fetchRole();
  }, []);

  return { role, loading, isAdmin: role === 'ADMINISTRADOR' };
};
```

---

## Protección de Rutas

### Middleware de Autenticación

Las rutas protegidas verifican la sesión antes de renderizar:

```typescript
// Ejemplo en page.tsx
export default async function ProtectedPage() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/login');
  }
  
  return <PageContent />;
}
```

### Rutas Protegidas por Rol

```typescript
// Verificación de rol de administrador
const { role } = useUserRole();

if (role !== 'ADMINISTRADOR') {
  return <UnauthorizedPage />;
}

return <AdminContent />;
```

### Rutas Públicas vs Privadas

#### Rutas Públicas
- `/` - Landing page
- `/auth/login` - Login
- `/auth/register` - Registro
- `/politica-privacidad` - Política de privacidad
- `/terminos-condiciones` - Términos y condiciones

#### Rutas Privadas (Requieren Autenticación)
- `/dashboard` - Dashboard general
- `/perfil` - Perfil de usuario
- `/student/*` - Todas las rutas de estudiante
- `/admin/*` - Todas las rutas de administrador (requieren rol ADMIN)

---

## Seguridad

### Mejores Prácticas Implementadas

1. **HTTPS Only**: Todas las comunicaciones encriptadas
2. **JWT Tokens**: Tokens seguros con expiración
3. **HttpOnly Cookies**: Tokens no accesibles desde JavaScript (en producción)
4. **CORS Configurado**: Restricción de orígenes
5. **Rate Limiting**: Protección contra ataques de fuerza bruta (Supabase)
6. **Email Verification**: Verificación de email opcional
7. **Password Strength**: Requisitos mínimos de contraseña

### Validación de Passwords

Requisitos mínimos (configurables en Supabase):
- Mínimo 6 caracteres
- Se recomienda: mayúsculas, minúsculas, números y símbolos

---

## Manejo de Errores

### Errores Comunes

```typescript
// Error de credenciales inválidas
{
  error: {
    message: 'Invalid login credentials',
    status: 400
  }
}

// Error de email ya registrado
{
  error: {
    message: 'User already registered',
    status: 422
  }
}

// Error de sesión expirada
{
  error: {
    message: 'JWT expired',
    status: 401
  }
}
```

### Manejo en el Frontend

```typescript
try {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      toast.error('Credenciales inválidas');
    } else if (error.message.includes('Email not confirmed')) {
      toast.error('Por favor, confirma tu email');
    } else {
      toast.error('Error al iniciar sesión');
    }
    return;
  }
  
  // Login exitoso
  router.push('/dashboard');
} catch (error) {
  console.error('Error inesperado:', error);
  toast.error('Error inesperado');
}
```

---

## Persistencia de Sesión

### LocalStorage

Supabase almacena automáticamente la sesión en `localStorage`:
- **Key**: `supabase.auth.token`
- **Contenido**: Session data + tokens
- **Persistencia**: Automática entre recargas

### Session Recovery

```typescript
// Al cargar la aplicación
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Sesión recuperada o renovada
        setUser(session?.user);
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

---

## Testing de Autenticación

### Cuentas de Prueba

Para desarrollo y testing:

```bash
# Estudiante
Email: estudiante@test.com
Password: test123

# Administrador
Email: admin@test.com
Password: admin123
```

### Mocking en Tests

```typescript
// Mock de Supabase Auth
jest.mock('@/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
    }
  }
}));
```

---

## Migración y Backup

### Exportar Usuarios

Supabase permite exportar usuarios desde el dashboard:
1. Ir a Authentication → Users
2. Exportar como CSV
3. Incluye: email, created_at, metadata

### Políticas de Seguridad (RLS)

Row Level Security configurado en Supabase:
- Los usuarios solo pueden ver/editar sus propios datos
- Los administradores tienen acceso completo

---

## Troubleshooting

### Problema: Token Expirado

**Síntoma**: Error 401 en requests
**Solución**: Supabase auto-refresh debería manejarlo. Si persiste, hacer logout/login manual.

### Problema: Sesión No Persiste

**Síntoma**: Usuario debe loguearse en cada recarga
**Solución**: Verificar que localStorage esté habilitado en el navegador.

### Problema: OAuth Redirect Loop

**Síntoma**: Redirección infinita después de OAuth
**Solución**: Verificar que la URL de callback esté correctamente configurada en Supabase.

---

**Próximo**: [Rutas y Navegación →](./08-rutas-navegacion.md)
