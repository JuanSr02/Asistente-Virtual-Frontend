/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para evitar problemas de chunks en desarrollo
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Configuración específica para desarrollo en el cliente
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            default: false,
            vendors: false,
            // Crear un chunk específico para vendor
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20
            },
            // Chunk común para código compartido
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true
            }
          }
        }
      }
    }
    return config
  },
  
  // Configuración experimental que puede ayudar
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js']
  },
  
  // Configuración adicional para desarrollo
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      // Período en ms para mantener las páginas en memoria
      maxInactiveAge: 25 * 1000,
      // Número de páginas que se deben mantener simultáneamente
      pagesBufferLength: 2,
    }
  })
}

module.exports = nextConfig