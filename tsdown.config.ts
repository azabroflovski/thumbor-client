import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: { 'thumbor-client': 'src/main.ts' },
    format: ['esm', 'cjs'],
    platform: 'neutral',
    target: 'es2020',
    dts: true,
    sourcemap: true
  },
  {
    // single file for <script> tags and CDNs
    entry: { 'thumbor-client': 'src/main.ts' },
    format: 'iife',
    globalName: 'ThumborClient',
    platform: 'browser',
    target: 'es2020',
    minify: true,
    sourcemap: true
  },
  {
    // kept for links to dist/thumbor-client.umd.cjs from 0.1.0 and earlier
    entry: { 'thumbor-client': 'src/main.ts' },
    format: 'umd',
    globalName: 'ThumborClient',
    platform: 'browser',
    target: 'es2020',
    outExtensions: () => ({ js: '.cjs' }),
    minify: true,
    sourcemap: true
  }
])
