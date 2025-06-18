import type { Config } from 'tailwindcss'

const config: Config = {
  // Configuración del modo oscuro usando clases CSS
  darkMode: ["class"],
  
  // Rutas donde Tailwind debe buscar clases CSS
  content: [
    // Archivos en src (incluye todos los tipos de archivos)
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    // Archivos en el directorio raíz (para casos especiales)
    "./*.{js,ts,jsx,tsx,mdx}",
    // Compatibilidad con estructura pages (por si migras desde Pages Router)
    "./pages/**/*.{js,jsx,ts,tsx,mdx}",
    // App directory (Next.js 13+)
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    // Componentes globales
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  
  theme: {
    extend: {
      // Sistema de colores usando CSS Custom Properties para theming dinámico
      colors: {
        // Colores base del sistema
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Colores primarios con escala completa
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          // Escala de azul moderno y profesional
          50: "#eff6ff",
          100: "#dbeafe", 
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6", // Color principal
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554", // Extra dark para mejor contraste
        },
        
        // Colores secundarios
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        
        // Colores para estados destructivos (errores, eliminaciones)
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        
        // Colores para elementos silenciados
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        
        // Colores de acento
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        
        // Colores para popovers y tooltips
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        
        // Colores para tarjetas
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        
        // Escala de grises mejorada
        gray: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e0",
          400: "#a0aec0",
          500: "#718096",
          600: "#4a5568",
          700: "#2d3748",
          800: "#1a202c",
          900: "#171923",
          950: "#0f1419", // Extra dark
        },
        
        // Colores adicionales para estados
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        
        warning: {
          50: "#fefce8",
          100: "#fef3c7",
          500: "#eab308",
          600: "#ca8a04",
          700: "#a16207",
        },
        
        error: {
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
      },
      
      // Sistema de border radius consistente
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      
      // Animaciones personalizadas
      animation: {
        // Animación para skeletons de carga
        "skeleton-loading": "skeleton-loading 1.5s ease-in-out infinite",
        // Animación de spin mejorada
        "spin-slow": "spin 2s linear infinite",
        "spin-fast": "spin 0.5s linear infinite",
        // Animaciones de entrada
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        // Animación de pulse suave
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
      
      // Definición de keyframes para las animaciones
      keyframes: {
        "skeleton-loading": {
          "0%": { 
            backgroundPosition: "200% 0",
            opacity: "1"
          },
          "50%": { 
            opacity: "0.8" 
          },
          "100%": { 
            backgroundPosition: "-200% 0",
            opacity: "1"
          },
        },
        "fade-in": {
          "0%": { 
            opacity: "0" 
          },
          "100%": { 
            opacity: "1" 
          },
        },
        "slide-in": {
          "0%": { 
            transform: "translateY(10px)",
            opacity: "0" 
          },
          "100%": { 
            transform: "translateY(0)",
            opacity: "1" 
          },
        },
        "scale-in": {
          "0%": { 
            transform: "scale(0.95)",
            opacity: "0" 
          },
          "100%": { 
            transform: "scale(1)",
            opacity: "1" 
          },
        },
        "pulse-soft": {
          "0%, 100%": { 
            opacity: "1" 
          },
          "50%": { 
            opacity: "0.7" 
          },
        },
      },
      
      // Gradientes personalizados
      backgroundImage: {
        // Gradiente principal del tema
        "gradient-primary": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        // Gradiente para modo oscuro
        "gradient-dark": "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
        // Gradiente para skeleton loading
        "skeleton": "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
        "skeleton-dark": "linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%)",
        // Gradientes adicionales
        "gradient-success": "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        "gradient-warning": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        "gradient-error": "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      },
      
      // Tamaños de background personalizados
      backgroundSize: {
        "skeleton": "200% 100%",
      },
      
      // Espaciado personalizado
      spacing: {
        '18': '4.5rem',  // 72px
        '88': '22rem',   // 352px
        '128': '32rem',  // 512px
      },
      
      // Tipografía mejorada
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }], // 10px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      },
      
      // Box shadows personalizadas
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  
  // Plugins necesarios
  plugins: [
    require("tailwindcss-animate"), // Para animaciones suaves
  ],
} satisfies Config

export default config