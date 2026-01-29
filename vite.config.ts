import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/lib'],
      exclude: ['src/components', 'src/App.tsx', 'src/main.tsx'],
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.lib.json'
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib/index.ts'),
      name: 'CromGeoFlowMap',
      fileName: (format) => `crom-geoflowmap.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'maplibre-gl', 'deck.gl', 'react-map-gl', '@deck.gl/layers', '@deck.gl/mapbox'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'maplibre-gl': 'maplibregl',
          'deck.gl': 'deck.gl',
          'react-map-gl': 'ReactMapGL'
        }
      }
    }
  }
})

