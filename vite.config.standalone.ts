import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    define: {
        'process.env': {
            NODE_ENV: JSON.stringify('production')
        }
    },
    build: {
        outDir: 'dist-standalone',
        lib: {
            entry: resolve(__dirname, 'src/lib/standalone.tsx'),
            name: 'CromGeoFlowMap',
            fileName: () => 'crom-geoflowmap.standalone.js',
            formats: ['iife']
        },
        rollupOptions: {
            external: [],
            output: {
                globals: {}
            }
        }
    }
});
