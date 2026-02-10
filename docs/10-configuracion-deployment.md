# ⚙️ Configuración y Deployment

## Variables de Entorno

### Variables Requeridas

Crear archivo `.env.local` en la raíz del proyecto:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# API Backend (Opcional - ya configurado en config.ts)
# NEXT_PUBLIC_API_URL=https://asistente-virtual-backend-wj8t.onrender.com
```

### Obtener Credenciales de Supabase

1. Ir a [Supabase Dashboard](https://app.supabase.com/)
2. Seleccionar tu proyecto
3. Ir a Settings → API
4. Copiar:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Configuración Local

### Archivo de Configuración Principal

**Ubicación**: `src/lib/config.ts`

```typescript
// 🌐 API
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 
  "https://asistente-virtual-backend-wj8t.onrender.com";

export const API_ROUTES = {
  ADMIN: { /* ... */ },
  SHARED: { /* ... */ },
  ESTUDIANTE: { /* ... */ },
};

// ⚙️ App config
export const APP_CONFIG = {
  NAME: "Asistente Virtual - Sistema Académico",
  PAGINATION_SIZE: 10,
  FILES: {
    ALLOWED_TYPES: [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/pdf",
    ],
    ALLOWED_EXTENSIONS: [".xls", ".xlsx", ".pdf"],
  },
};
```

---

## Deployment en Vercel

### Setup Inicial

1. **Conectar Repositorio**
   - Ir a [Vercel Dashboard](https://vercel.com/dashboard)
   - Click en "Add New Project"
   - Importar repositorio de GitHub

2. **Configurar Variables de Entorno**
   - En Project Settings → Environment Variables
   - Agregar:
     ```
     NEXT_PUBLIC_SUPABASE_URL
     NEXT_PUBLIC_SUPABASE_ANON_KEY
     ```

3. **Configurar Build Settings**
   - Framework Preset: **Next.js**
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

4. **Deploy**
   - Click en "Deploy"
   - Esperar a que termine el build

### Configuración Avanzada

#### Dominios Personalizados

1. Ir a Project Settings → Domains
2. Agregar dominio personalizado
3. Configurar DNS según instrucciones

#### Variables de Entorno por Ambiente

```bash
# Production
NEXT_PUBLIC_SUPABASE_URL=https://prod.supabase.co

# Preview (branches)
NEXT_PUBLIC_SUPABASE_URL=https://staging.supabase.co

# Development
NEXT_PUBLIC_SUPABASE_URL=https://dev.supabase.co
```

---

## Build de Producción

### Build Local

```bash
# Crear build de producción
pnpm build

# Verificar build
pnpm start

# Abrir en http://localhost:3000
```

### Análisis de Bundle

```bash
# Generar análisis de bundle
pnpm analyze

# Se abrirá visualización en el navegador
```

---

## Configuración de Next.js

### `next.config.js`

```javascript
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  // Webpack optimization
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          cacheGroups: {
            vendor: {
              name: "vendor",
              chunks: "all",
              test: /node_modules/,
              priority: 20,
            },
            common: {
              name: "common",
              minChunks: 2,
              chunks: "all",
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }
    return config;
  },

  // Turbopack
  turbopack: {},

  // Experimental features
  experimental: {
    optimizePackageImports: ["@supabase/supabase-js"],
  },

  // Development config
  ...(process.env.NODE_ENV === "development" && {
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
  }),
};

module.exports = withPWA(nextConfig);
```

---

## Configuración de TypeScript

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Configuración de Tailwind

### `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx,css}",
    "./*.{js,ts,jsx,tsx,mdx,css}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... más colores
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "skeleton-loading": "skeleton-loading 1.5s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
      },
      keyframes: {
        "skeleton-loading": {
          "0%": { backgroundPosition: "200% 0", opacity: "1" },
          "50%": { opacity: "0.8" },
          "100%": { backgroundPosition: "-200% 0", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## PWA Configuration

### `public/manifest.json`

```json
{
  "name": "Asistente Virtual UNSL",
  "short_name": "Asistente UNSL",
  "description": "Asistente virtual para gestión académica",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## CI/CD con GitHub Actions

### Workflow de Deploy Automático

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches:
      - main
      - develop

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Type check
        run: pnpm type-check
      
      - name: Lint
        run: pnpm lint
      
      - name: Build
        run: pnpm build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

---

## Monitoreo y Analytics

### Vercel Analytics

Ya incluido en el proyecto:

```typescript
// src/app/layout.tsx
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

### Métricas Disponibles

- **Page Views**: Vistas de página
- **User Sessions**: Sesiones de usuario
- **Performance**: Core Web Vitals
- **Custom Events**: Eventos personalizados

---

## Optimizaciones de Producción

### Image Optimization

```typescript
import Image from 'next/image';

// ✅ Usar Next.js Image component
<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority // Para imágenes above the fold
/>
```

### Font Optimization

```typescript
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

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

### Code Splitting

```typescript
import dynamic from 'next/dynamic';

// Lazy load de componentes pesados
const HeavyComponent = dynamic(
  () => import('./HeavyComponent'),
  { 
    loading: () => <p>Cargando...</p>,
    ssr: false 
  }
);
```

---

## Troubleshooting de Deployment

### Error: "Build failed"

1. Verificar logs en Vercel
2. Ejecutar `pnpm build` localmente
3. Verificar variables de entorno

### Error: "Module not found"

1. Verificar que todas las dependencias estén en `package.json`
2. Ejecutar `pnpm install`
3. Verificar imports con path aliases (`@/*`)

### Error: "Type errors"

1. Ejecutar `pnpm type-check`
2. Corregir errores de TypeScript
3. Rebuild

---

## Rollback

### Rollback en Vercel

1. Ir a Deployments
2. Seleccionar deployment anterior
3. Click en "Promote to Production"

### Rollback con Git

```bash
# Revertir último commit
git revert HEAD

# Revertir a commit específico
git revert <commit-hash>

# Push
git push origin main
```

---

## Checklist de Deployment

Antes de hacer deploy a producción:

- [ ] Variables de entorno configuradas
- [ ] Build exitoso localmente (`pnpm build`)
- [ ] Sin errores de TypeScript (`pnpm type-check`)
- [ ] Sin errores de ESLint (`pnpm lint`)
- [ ] Tests pasando (si aplica)
- [ ] Changelog actualizado
- [ ] Documentación actualizada
- [ ] Performance verificado
- [ ] SEO verificado

---

**Próximo**: [Performance y Optimización →](./14-performance.md)
