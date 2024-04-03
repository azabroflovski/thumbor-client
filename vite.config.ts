import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
    build: {
        sourcemap: true,
        lib: {
            // Could also be a dictionary or array of multiple entry points
            entry: resolve(__dirname, './src/lib/index.ts'),
            name: 'ThumborClient',
            // the proper extensions will be added
            fileName: 'thumbor-client',
            formats: ['es', 'cjs', 'umd', "iife"]
        },
        rollupOptions: {
            // make sure to externalize deps that shouldn't be bundled
            // into your library
            external: ['vue'],
            output: {
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    vue: 'Vue',
                },
            },
        },
    },

    plugins: [dts()]
})
