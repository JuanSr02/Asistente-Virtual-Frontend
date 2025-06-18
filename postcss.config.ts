// Tipo personalizado para la configuración de PostCSS
interface PostCSSConfig {
  plugins: Record<string, any>
}

const config: PostCSSConfig = {
  plugins: {
    // Tailwind CSS - Framework de utilidades CSS
    tailwindcss: {},
    
    // Autoprefixer - Agrega prefijos de navegador automáticamente
    // Soporta navegadores basado en browserslist
    autoprefixer: {
      // Configuración explícita para mayor control
      overrideBrowserslist: [
        // Navegadores modernos (últimas 2 versiones)
        'last 2 versions',
        // Chrome y derivados (Edge, Opera, etc.)
        'Chrome >= 91',
        // Firefox
        'Firefox >= 90',
        // Safari (desktop y mobile)
        'Safari >= 14',
        // Edge moderno
        'Edge >= 91',
        // Soporte móvil
        'iOS >= 14',
        'Android >= 10',
        // Eliminar soporte para IE (no compatible con Next.js 13+)
        'not IE 11',
        'not dead',
        // Navegadores con más del 0.5% de uso global
        '> 0.5%',
      ],
      // Configuraciones adicionales
      grid: 'autoplace', // Soporte para CSS Grid automático
      flexbox: 'no-2009', // Evita flexbox legacy
    },
    
    // PostCSS Import - Permite @import en archivos CSS
    // Útil si usas archivos CSS modulares
    'postcss-import': {},
    
    // PostCSS Nested - Permite CSS anidado (similar a Sass)
    // Funciona bien con Tailwind para casos específicos
    'postcss-nested': {},
    
    // PostCSS Custom Properties - Mejora el soporte de CSS Variables
    'postcss-custom-properties': {
      // Preserva las custom properties en el output
      preserve: true,
      // Permite importar custom properties desde archivos
      importFrom: [
        // Puedes agregar rutas a archivos con variables CSS
        // './src/styles/variables.css'
      ],
    },
    
    // Optimizaciones para producción
    ...(process.env.NODE_ENV === 'production' && {
      // CSSnano - Minificación y optimización CSS
      cssnano: {
        preset: [
          'default',
          {
            // Configuración de optimización
            discardComments: {
              removeAll: true, // Elimina todos los comentarios
            },
            // Mantiene algunos valores importantes
            normalizeWhitespace: true,
            // Optimiza selectores
            mergeRules: true,
            // Optimiza propiedades duplicadas
            mergeDuplicateDeclarations: true,
            // Reduce valores redundantes
            reduceIdents: false, // Mantiene nombres de animaciones
            // Ordena propiedades CSS
            autoprefixer: false, // Ya lo manejamos arriba
          },
        ],
      },
      
      // PurgeCSS - Elimina CSS no utilizado (opcional, Tailwind ya lo hace)
      // Solo si necesitas purgar CSS adicional fuera de Tailwind
      '@fullhuman/postcss-purgecss': {
        content: [
          './src/**/*.{js,jsx,ts,tsx}',
          './pages/**/*.{js,jsx,ts,tsx}',
          './components/**/*.{js,jsx,ts,tsx}',
          './app/**/*.{js,jsx,ts,tsx}',
        ],
        // Clases a conservar siempre
        safelist: [
          // Clases dinámicas que se generan en JavaScript
          /^bg-(red|green|blue|yellow|purple|pink|indigo)-(100|200|300|400|500|600|700|800|900)$/,
          /^text-(red|green|blue|yellow|purple|pink|indigo)-(100|200|300|400|500|600|700|800|900)$/,
          // Clases de animación
          /^animate-/,
          // Clases de estado
          'dark',
          'light',
        ],
        // Extensiones por defecto con tipado correcto
        defaultExtractor: (content: string): string[] => content.match(/[\w-/:]+(?<!:)/g) || [],
      },
    }),
  },
}

export default config