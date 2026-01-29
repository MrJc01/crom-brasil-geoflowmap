import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Library build mode
  if (mode === 'lib') {
    return {
      plugins: [
        react(),
        dts({
          include: ['src/lib'],
          exclude: ['src/components', 'src/pages'],
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
    }
  }

  // Default: MPA site build
  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          editor: resolve(__dirname, 'editor.html'),
          docs: resolve(__dirname, 'docs.html')
        }
      }
    }
  }
})
