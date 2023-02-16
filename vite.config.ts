import { resolve } from 'path'
import { URL, fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

interface Libs {
  player: any
  externalized: any
  plugin: any
}

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const libs: Libs = {
  player: {
    lib: {
      name: 'vaddk-player',
      entry: resolve(__dirname, './src/player.ts'),
      formats: ['es', 'umd'],
      fileName: 'player',
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo: any) => {
          if (assetInfo.name === 'style.css') return 'player.css'
          return assetInfo.name || 'asset'
        },
      },
    },
  },
  externalized: {
    emptyOutDir: false,
    lib: {
      name: 'vaddk-player',
      entry: resolve(__dirname, './src/player.ts'),
      formats: ['es', 'umd'],
      fileName: 'externalized',
    },
    rollupOptions: {
      output: {
        globals: {
          'vue': 'Vue',
          'pinia': 'Pinia',
          '@vaddk/calendar': 'Calendar',
          '@vaddk/toastification': 'Toast',
        },
        assetFileNames: (assetInfo: any) => {
          if (assetInfo.name === 'style.css') return 'externalized.css'
          return assetInfo.name || 'asset'
        },
      },
      external: ['vue', 'pinia', '@vaddk/calendar', '@vaddk/toastification'],
    },
  },
  plugin: {
    emptyOutDir: false,
    lib: {
      name: 'vaddk-player',
      entry: resolve(__dirname, './src/plugin.ts'),
      formats: ['es'],
      fileName: 'plugin',
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo: any) => {
          if (assetInfo.name === 'style.css') return 'plugin.css'
          return assetInfo.name || 'asset'
        },
      },
      external: ['vue', 'pinia', '@vaddk/calendar', '@vaddk/toastification'],
    },
  },
}

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return {
      plugins: [
        vue(),
      ],
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
      },
      optimizeDeps: {
        entries: ['hls.js'],
      },
    }
  } else {
    const lib = process.env.LIB_MODE
    if (!lib) return {}
    return {
      publicDir: false,
      configFile: false,
      plugins: [
        vue(),
      ],
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
      },
      // @ts-expect-error: string process params
      build: libs[lib],
      define: { 'process.env.NODE_ENV': '"production"' },
    }
  }
})
