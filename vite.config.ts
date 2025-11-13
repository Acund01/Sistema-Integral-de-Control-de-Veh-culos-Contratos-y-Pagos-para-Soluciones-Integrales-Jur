import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/clientes': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/vehiculos': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/modelos': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/marcas': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/tipos-vehiculo': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/contratos': {
        target: 'http://localhost:8084',
        changeOrigin: true,
      },
      '/api/comprobantes': {
        target: 'http://localhost:8084',
        changeOrigin: true,
      },
      '/api/reportes': {
        target: 'http://localhost:8085', 
        changeOrigin: true,
      },
    },
  },
})
